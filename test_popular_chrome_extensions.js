const assert = require('node:assert');
const { chromium, devices } = require('playwright');
const fs = require("fs");
const { chrome } = require('node:process');


(async () => {
    // Setup
    const browser = await chromium.launch();
    const filepath_to_original_extensions = '/Users/sean/Downloads/Extensions:Research/Popular_extensions_to_test_research';
    const filepath_to_extension_copies = '/Users/sean/Downloads/Extensions:Research/Extension_copies';
    const extension_ids = [
        'bmnlcjabgnpnenekpadlanbbkooimhnj', 'kbfnbcaeplbcioakkpcpgfkobkghlhen',
        'gbkeegbaiigmenfmjfclcdgdpimamgkj', 'laookkfknpbbblfpciffpaejjkokdgca',
        'ghgabhipcejejjmhhchfonmamedcbeod', 'mmeijimgabbpbgpdklnllpncmdofkcpn',
        'gohjpllcolmccldfdggmamodembldgpc', 'nenlahapcbofgnanklpelkaejcehkggg',
        'iginnfkhmmfhlkagcmpgofnjhanpmklb', 'ogdlpmhglpejoiomcodnpjnfgcpmgale',
        'inoeonmfapjbbkmdafoankkfajkcphgd', 'oocalimimngaihdkbihfgmpkcpnmlaoa',
        'jghecgabfgfdldnmbfkhmffcabddioke', 'pioclpoplcdbaefihamjohnefbikjilc',
        'jldhpllghnbhlbpcmnajkpdmadaolakh'
    ];
    /* 
    copies extensions into copy folder so edits are not persistent
    overwrites contents of file, so no need to delete files
    */
    fs.cpSync(filepath_to_original_extensions, filepath_to_extension_copies, { recursive: true, force: true });

    //setTimeout(() => {console.log("sleeping!\n")}, 10000);
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

    //DONE - go through content script array, add a new content script with proxy info that gets added per webpage
    //DONE -  add content script info to content script array

    
    // figure out how to pause between navigation
    // DONE - figure out how to get from webpage console to terminal console

    //addeventlistener

    // DONE - add hooks to background
    // DONE - deal with V2 and V3 differences
    // read background from playwright, 

    // broadcast channel

    /*
    Goes through the files in the extensions folder, and parses each manifest file
    to extract URLs that are likely to trigger events
    */
    for (let x = 0; x < extension_ids.length; x++) {
        var manifest = JSON.parse(fs.readFileSync(filepath_to_extension_copies + '/' + extension_ids[x] + '/' + 'manifest.json', "utf8"));
        // copies the proxy content script into each copy of the extensions       
        fs.copyFileSync("/Users/sean/Downloads/Extensions:Research/proxy_content_script.js", filepath_to_extension_copies + '/' + extension_ids[x] + '/' + "proxy_content_script.js");
        var data = fs.readFileSync(filepath_to_extension_copies + '/' + extension_ids[x] + '/' + 'manifest.json', "utf8");
        var fd = fs.openSync(filepath_to_extension_copies + '/' + extension_ids[x] + '/' + 'manifest.json', 'w+');
        
        if (manifest.hasOwnProperty("content_scripts")) {
            for (let i = 0; i < manifest.content_scripts.length; i++) {

                // look for URLs to extract
                if (manifest.content_scripts[i].hasOwnProperty("matches")) {
                    for (let j = 0; j < manifest.content_scripts[i].matches.length; j++) {
                        let extracted_url = manifest.content_scripts[i].matches[j];
                        update_urls(extracted_urls, extracted_url);
                    }
                }
            }

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
            
        }
        // if manifest doesn't have content scripts, add a section that contains content_scripts
        else {
            buffer = `"content_scripts": [{ 
                "matches": [
                    "http://*/*",
                    "https://*/*"
                  ],
                "js": ["proxy_content_script.js"],
                "run_at": "document_start"
            }],`;
            data = "{" + buffer + data.substring(1);
            
        }
        fs.writeSync(fd, data, 0, data.length);
        fs.close(fd);
        if (manifest.hasOwnProperty("background")) {
            
            // The below code adds hooks to the background service workers
            fs.copyFileSync("/Users/sean/Downloads/Extensions:Research/proxy_background.js", filepath_to_extension_copies + '/' + extension_ids[x] + '/' + "proxy_background.js");
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

    };


    // creates a single comma seperated string with filepaths to the extensions to test
    var single_string_of_filepaths = "";
    for (let i = 0; i < extension_ids.length; i++) {
        single_string_of_filepaths += filepath_to_extension_copies + '/' + extension_ids[i] + ',';
    }
    //console.log(single_string_of_filepaths);
    const context = await chromium.launchPersistentContext('', {
        headless: false,
        args: [
            `--disable-extensions-except=${single_string_of_filepaths}`,
            `--load-extension=${single_string_of_filepaths}`,
            `--proxy-server=127.0.0.1:8080`,
            // change certificate if using different computer
            `--ignore-certificate-errors-spki-list=ZWNCSHpvR3JmOVV6UjQ4NlYwcFA2RHNyVHZLOVc3NGtjdTZ5VDFUZzAybz0K`
        ],

    });
    var temp_count = 0;
    for (let url in extracted_urls){
        // this is just to speed up the process, otherwise it visits way too many URLs
        if (extracted_urls[url] < 2){
            continue;
        }
        if (temp_count > 20){
            console.log("temp max page count reached")
            break;
        }
        temp_count++;

        let page = await context.newPage();
        page.on('console', msg => {
            //console.log(msg.text());
            if (msg.text().includes("Fetch API invoked with args") || msg.text().includes("chrome.webRequest.onHeadersReceived.addListener API invoked with args")|| msg.text().includes("test!!")){
                //console.log(msg.text());
            }
        });
        try{
            await page.goto(url);
        } catch(e){
            console.log(e);
        }

    }
    //manifest V2
    let service_workers = [];
    if (context.backgroundPages().length){
        //console.log(context.backgroundPages().length)
        for (let i = 0; i < context.backgroundPages().length; i++){
            service_workers.push(context.backgroundPages()[i]);
        }
    }
    //manifest V3
    if (context.serviceWorkers().length){
        //console.log(context.serviceWorkers().length)
        for (let i = 0; i < context.serviceWorkers().length; i++){
            service_workers.push(context.serviceWorkers()[i]);
        }
    }
    console.log(service_workers.length);
    for (let i = 0; i < service_workers.length; i++){
        try {
            let temp = await service_workers[i].evaluate(() => {
                return [chrome.runtime.id, proxied_data];
            });
            console.log(temp);
        } catch (e) {
            console.log(e);
        }
    }   
    await context.close();

})();