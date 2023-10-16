const assert = require('node:assert');
const process = require('process');
const { chromium, devices } = require('playwright');
const fs = require("fs");
const { chrome } = require('node:process');
const { execSync } = require('node:child_process');
const { type } = require('node:os');

(async () => {
    
    //downloads the extension IDs that are called in the arguments list 
    const args = process.argv;
    for (let i = 2; i < args.length; i++){
        execSync(`node download_extension.js ${args[i]}`);
    }
    const config = JSON.parse(fs.readFileSync('config.json'));  
    const filepath_to_original_extensions = 'cexts/unzips';
    const filepath_to_extension_copies = 'Extension_copies';
    const filepath_to_proxy_content_script = 'proxy_content_script.js';
    const filepath_to_proxy_background = 'proxy_background.js';
    const extension_ids = fs.readdirSync(filepath_to_original_extensions);
    //console.log(extension_ids);
    fs.cpSync(filepath_to_original_extensions, filepath_to_extension_copies, { recursive: true, force: true });

    /*
    A helper function that tracks how frequent URLs appear in manifest files
    */
    var extracted_urls = {};
    function update_urls(extracted_urls, url) {
        if (url == 'http://*/*' || url == 'https://*/*' || url == '<all_urls>' || url == '*://*/*' || url.slice(0, 3) == 'ftp') {
            return;
        }
        if (url[url.length - 1] == "*") {
            url = url.substring(0, url.length - 2);
        }
        if (url[url.length - 1] == "/") {
            url = url.substring(0,url.length - 1);
        }
        if (url[0] == "*") {
            url = "https" + url.slice(1);
        }
        if (url.search("\\*") != -1) {
            url = url.substring(0, url.search("\\*")) + url.substring(url.search("\\*") + 2);
        }
        if (url in extracted_urls) {
            extracted_urls[url] += 1;
        }
        else {
            extracted_urls[url] = 1;
        }
    }

    /*
    A helper function that parses a content script in the format of a string to 
    search for event Listeners specifically for buttons
    */
    function find_buttons(content){
        //console.log(data);

        // // goes through string, keeps taking substrings until no more instances 
        // while (content.search(`addEventListener("click"`)!= -1){
        //     //search for last instance of 
        // }
    }

    /*
    Goes through the files in the extensions folder, and parses each manifest file
    to extract URLs that are likely to trigger events, as well buttons that might trigger behavior
    */
    for (let x = 0; x < extension_ids.length; x++) {
        var manifest = JSON.parse(fs.readFileSync(filepath_to_extension_copies + '/' + extension_ids[x] + '/' + 'manifest.json', "utf8"));
        // copies the proxy content script into each copy of the extensions       
        fs.copyFileSync(filepath_to_proxy_content_script, filepath_to_extension_copies + '/' + extension_ids[x] + '/' + "proxy_content_script.js");
        
        if (manifest.hasOwnProperty("content_scripts")) {
            for (let i = 0; i < manifest.content_scripts.length; i++) {

                // look for URLs to extract, as well as buttons on these URLs 
                if (manifest.content_scripts[i].hasOwnProperty("matches")) {
                    // parses URLs
                    for (let j = 0; j < manifest.content_scripts[i].matches.length; j++) {
                        let extracted_url = manifest.content_scripts[i].matches[j];
                        update_urls(extracted_urls, extracted_url);
                    }
                    // parses all content script js files to look for addEventListener functions
                    if (manifest.content_scripts[i].hasOwnProperty("js")){
                        for (let j = 0; j < manifest.content_scripts[i].js.length; j++){
                            var data = fs.readFileSync(filepath_to_extension_copies + '/' + extension_ids[x] + '/' + manifest.content_scripts[i].js[j], "utf8");
                            find_buttons(data);
                        }
                    }
                }
                 
            }

            //below code edits the manifest file
            var data = fs.readFileSync(filepath_to_extension_copies + '/' + extension_ids[x] + '/' + 'manifest.json', "utf8");
            var fd = fs.openSync(filepath_to_extension_copies + '/' + extension_ids[x] + '/' + 'manifest.json', 'w+');
            // append to content script part in manifest to add proxy_content_script.js as a content script
            let buffer = `"content_scripts": [{ 
                "matches": [
                    "http://*/*",
                    "https://*/*"
                  ],
                "js": ["proxy_content_script.js"],
                "run_at": "document_start"
            },`;
    
            data = data.replace(`"content_scripts": [`, buffer);
            fs.writeSync(fd, data, 0, data.length);
            fs.close(fd);        
        }
        // if manifest doesn't have content scripts, add a section that contains content_scripts
        else {
            var data = fs.readFileSync(filepath_to_extension_copies + '/' + extension_ids[x] + '/' + 'manifest.json', "utf8");
            var fd = fs.openSync(filepath_to_extension_copies + '/' + extension_ids[x] + '/' + 'manifest.json', 'w+');
            buffer = `"content_scripts": [{ 
                "matches": [
                    "http://*/*",
                    "https://*/*"
                  ],
                "js": ["proxy_content_script.js"],
                "run_at": "document_start"
            }],`;
            data = "{" + buffer + data.substring(1);
            
            fs.writeSync(fd, data, 0, data.length);
            fs.close(fd);
            
        }
        
        if (manifest.hasOwnProperty("background")) {
            
            // The below code adds hooks to the background service workers
            fs.copyFileSync(filepath_to_proxy_background, filepath_to_extension_copies + '/' + extension_ids[x] + '/' + "proxy_background.js");
            if (manifest.manifest_version == 2) {
                
                // updates the manifest file to include new proxy code
                var data = fs.readFileSync(filepath_to_extension_copies + '/' + extension_ids[x] + '/' + 'manifest.json', "utf8");
                var fd = fs.openSync(filepath_to_extension_copies + '/' + extension_ids[x] + '/' + 'manifest.json', 'w+');
                let buffer = `"scripts": ["proxy_background.js",`;
                data = data.replace(`"scripts": [`, buffer);
                fs.writeSync(fd, data, 0, data.length);
                fs.close(fd);
            }
            else if (manifest.manifest_version == 3){

                // add proxy code to background service worker file
                var data = fs.readFileSync(filepath_to_extension_copies + '/' + extension_ids[x] + '/' + manifest.background.service_worker, "utf8");
                var fd = fs.openSync(filepath_to_extension_copies + '/' + extension_ids[x] + '/' + manifest.background.service_worker, 'w+');
                data = "importScripts('proxy_background.js');" + data;
                fs.writeSync(fd, data, 0, data.length);
                fs.close(fd);
            }
        }
        if (manifest.hasOwnProperty("externally_connectable")) {
            if (manifest.externally_connectable.hasOwnProperty("matches")) {
                for (let i = 0; i < manifest.externally_connectable.matches.length; i++) {
                    let extracted_url = manifest.externally_connectable.matches[i];
                    update_urls(extracted_urls, extracted_url);
                }
            }
        }
        if (manifest.hasOwnProperty("web_accessible_resources")) {
            for (let i = 0; i < manifest.web_accessible_resources.length; i++) {
                if (manifest.web_accessible_resources[i].hasOwnProperty("matches")) {
                    for (let j = 0; j < manifest.web_accessible_resources[i].matches.length; j++) {
                        let extracted_url = manifest.web_accessible_resources[i].matches[j];
                        update_urls(extracted_urls, extracted_url);
                    }
                }
            }
        }
        if (manifest.hasOwnProperty("permissions")) {
            if (manifest.permissions.hasOwnProperty("host_permissions")) {
                for (let i = 0; i < manifest.host_permissions.length; i++) {
                    let extracted_url = manifest.host_permissions[i];
                    update_urls(extracted_urls, extracted_url);
                }
            }
            if (manifest.permissions.hasOwnProperty("optional_host_permissions")) {
                for (let i = 0; i < manifest.optional_host_permissions.length; i++) {
                    let extracted_url = manifest.optional_host_permissions[i];
                    update_urls(extracted_urls, extracted_url);
                }
            }
        }

    };

    // goes through all service workers, sees if things like buttons would trigger behavior
    // check for addEventListener('click'), see which id it's attached to, see which website
    // its supposed to trigger on

    

    // addEventListener('click')

    // creates a single comma seperated string with filepaths to the extensions to test
    var single_string_of_filepaths = "";
    for (let i = 0; i < extension_ids.length; i++) {
        single_string_of_filepaths += filepath_to_extension_copies + '/' + extension_ids[i] + ',';
    }
    
    const browser = await chromium.launch();
    const context = await chromium.launchPersistentContext('', {
        headless: false,
        args: [
            `--disable-extensions-except=${single_string_of_filepaths}`,
            `--load-extension=${single_string_of_filepaths}`,
            `--proxy-server=${config.proxy_server}`,
            `--ignore-certificate-errors-spki-list=${config.certificate}`
        ],

    });
    
    // all arguments and their callers are stored in these arrays,
    // which are output into a text file for results
    var content_script_args = [];
    var background_args = [];


    // at this point, don't allow redirects if we click or submit any info

    var website_count = 0;
    for (let url in extracted_urls){
        // this is just to speed up the process, otherwise it visits way too many URLs
        if (extracted_urls[url] < 2){
            continue;
        }
        if (website_count > config.website_count){
            console.log("max page count reached")
            break;
        }
        website_count++;

        let page = await context.newPage();
        // this tracks console logs from content scripts
        page.on('console', msg => {
            
            if (msg.text().includes("addEventListener function called")){
                content_script_args.push(msg.text());
            }
            if (msg.text().includes("API invoked with args")){
                content_script_args.push(msg.text());
                // look for any listeners for clicks
                if (msg.text().includes("click")){
                    
                }
            }
            
        });
        try{
            await page.goto(url);
            // once we visit the website, if it has any password forms, fill them out
            for (const li of await page.getByRole('button').all()){
                await li.click();
            }
        } catch(e){
            console.log(e);
        }

    }
    //manifest V2
    let service_workers = [];
    if (context.backgroundPages().length){       
        for (let i = 0; i < context.backgroundPages().length; i++){
            service_workers.push(context.backgroundPages()[i]);
        }
    }
    //manifest V3
    if (context.serviceWorkers().length){
        for (let i = 0; i < context.serviceWorkers().length; i++){
            service_workers.push(context.serviceWorkers()[i]);
        }
    }
    
    for (let i = 0; i < service_workers.length; i++){
        try {
            let temp = await service_workers[i].evaluate(() => {
                return proxied_data;
                
            });
            for (let j = 0; j < temp.length; j++){
                background_args.push(temp[j].slice());
            }
        } catch (e) {
            console.log(e);
        }
    } 


    //timestamp when things are logged
    //add a pc to each array element
    //JSON.stringify the objects




    /*
    Prints how often APIs are called by content scripts and which extensions are calling them
    */
    // console.log("chrome.webRequest.onHeadersReceived.addListener:", chromewebRequestonHeadersReceivedaddListener) 
    // console.log("chrome.runtime.sendMessage",chromeruntimesendMessage) 
    // console.log("chrome.runtime.onMessage.addListener",chromeruntimeonMessageaddListener)
    // console.log("chrome.runtime.onConnect.addListener", chromeruntimeonConnectaddListener)
    // console.log("window.addEventListener", windowaddEventListener)
    // console.log("document.addEventListener", documentaddEventListener)

    results_folder = fs.readdirSync('results');
    fs.writeFileSync(`results/content_script_args_${Math.floor(results_folder.length/2)+1}`, JSON.stringify(content_script_args, null, '\n'));
    fs.writeFileSync(`results/background_args_${Math.floor(results_folder.length/2) + 1}`, JSON.stringify(background_args, null, '\n'));
    //console.log(content_script_args);
    //console.log(background_args);
    await context.close();
    await browser.close();

})();