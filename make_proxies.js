const assert = require('node:assert');
const process = require('process');
const { chromium, devices } = require('playwright');
const fs = require("fs");
const { chrome } = require('node:process');
const { execSync } = require('node:child_process');

(async() => {
    const config = JSON.parse(fs.readFileSync('config.json')); 
    var buffer = "var proxied_data = [];";    
    for (let i = 0; i < config.service_workers_to_proxy.length; i++){
        let temp = 
        `try {
            ${config.service_workers_to_proxy[i]} = new Proxy(${config.service_workers_to_proxy[i]}, {
                apply: function(target, thisArg, args) {
                    let args_to_strings = [];
                    for (let j = 0; j < args.length; j++){
                        if (typeof(args[j]) === 'object' && args[j] !== null){
                            args_to_strings.push(JSON.stringify(args[j]));
                        }
                        else {
                            args_to_strings.push(args[j]);
                        }
                    } 
                    proxied_data.push(["${config.service_workers_to_proxy[i]}", chrome.runtime.id, Date.now(), args_to_strings]);
                    return target.apply(thisArg, args);
                }
            });
        } catch(e) {}`;
        buffer += temp;
    }
    fs.writeFileSync("proxy_background.js", buffer);

    buffer = "";
    for (let i = 0; i < config.content_scripts_to_proxy.length; i++){
        let temp = 
        `try {
            ${config.content_scripts_to_proxy[i]} = new Proxy(${config.content_scripts_to_proxy[i]}, {
                apply: function(target, thisArg, args) {
                    let args_to_strings = [];
                    for (let j = 0; j < args.length; j++){
                        if (typeof(args[j]) === 'object' && args[j] !== null){
                            args_to_strings.push(JSON.stringify(args[j]));
                        }
                        else {
                            args_to_strings.push(args[j]);
                        }
                    }
                    console.log("${config.content_scripts_to_proxy[i]} API invoked with args", args_to_strings, chrome.runtime.id, Date.now());
                    return target.apply(thisArg, args);
                }
            })
        } catch(e) {}`;
        
        buffer += temp;
    }
    fs.writeFileSync("proxy_content_script.js", buffer);
})();