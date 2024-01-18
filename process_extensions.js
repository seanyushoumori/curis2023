const assert = require('node:assert');
const process = require('process');
const { chromium, devices } = require('playwright');
const fs = require("fs");
const { chrome } = require('node:process');
const { execSync } = require('node:child_process');
const { type } = require('node:os');

(async () => {

    const config = JSON.parse(fs.readFileSync('config.json'));
    const extensions_list = Object.values(JSON.parse(fs.readFileSync(config.extensions_list_location)));
    const extensions_location = config.extensions_location;
    const filepath_to_proxy_content_script = 'proxy_content_script.js';
    const filepath_to_proxy_background = 'proxy_background.js';
    
    /* Downloads the extensions*/
    for (let i = 0; i < extensions_list.length; i++) {
        execSync(`node download_extension.js ${extensions_list[i]}`);
    }

    console.log(extensions_list);
    

    
    /*
    Goes through the files in the extensions folder, and parses each manifest file
    to add proxies
    */
    for (let x = 0; x < extensions_list.length; x++) {
        var manifest = JSON.parse(fs.readFileSync(extensions_location + '/' + extensions_list[x] + '/' + 'manifest.json', "utf8"));
        // copies the proxy content script into each copy of the extensions       
        fs.copyFileSync(filepath_to_proxy_content_script, extensions_location + '/' + extensions_list[x] + '/' + "proxy_content_script.js");

        if (manifest.hasOwnProperty("content_scripts")) {
            //below code edits the manifest file
            var data = fs.readFileSync(extensions_location + '/' + extensions_list[x] + '/' + 'manifest.json', "utf8");
            var fd = fs.openSync(extensions_location + '/' + extensions_list[x] + '/' + 'manifest.json', 'w+');
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
            var data = fs.readFileSync(extensions_location + '/' + extensions_list[x] + '/' + 'manifest.json', "utf8");
            var fd = fs.openSync(extensions_location + '/' + extensions_list[x] + '/' + 'manifest.json', 'w+');
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
            fs.copyFileSync(filepath_to_proxy_background, extensions_location + '/' + extensions_list[x] + '/' + "proxy_background.js");
            if (manifest.manifest_version == 2) {

                // updates the manifest file to include new proxy code
                var data = fs.readFileSync(extensions_location + '/' + extensions_list[x] + '/' + 'manifest.json', "utf8");
                var fd = fs.openSync(extensions_location + '/' + extensions_list[x] + '/' + 'manifest.json', 'w+');
                let buffer = `"scripts": ["proxy_background.js",`;
                data = data.replace(`"scripts": [`, buffer);
                fs.writeSync(fd, data, 0, data.length);
                fs.close(fd);
            }
            else if (manifest.manifest_version == 3) {

                // add proxy code to background service worker file
                var data = fs.readFileSync(extensions_location + '/' + extensions_list[x] + '/' + manifest.background.service_worker, "utf8");
                var fd = fs.openSync(extensions_location + '/' + extensions_list[x] + '/' + manifest.background.service_worker, 'w+');
                data = "importScripts('proxy_background.js');" + data;
                fs.writeSync(fd, data, 0, data.length);
                fs.close(fd);
            }
        }

    };
     

})();