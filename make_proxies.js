const assert = require('node:assert');
const process = require('process');
const { chromium, devices } = require('playwright');
const fs = require("fs");
const { chrome } = require('node:process');
const { execSync } = require('node:child_process');

(async() => {
    const config = JSON.parse(fs.readFileSync('config.json')); 
    var buffer = "var proxied_data = []; var pc = 0;";    
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
                    proxied_data.push(["${config.service_workers_to_proxy[i]}", chrome.runtime.id, Date.now(), pc, args_to_strings]);
                    pc += 1;
                    return target.apply(thisArg, args);
                }
            });
        } catch(e) {}`;
        buffer += temp;
    }
    fs.writeFileSync("proxy_background.js", buffer);

    buffer = "var pc = 0;";
    // add window.addEventListener back to content_scripts_to_proxy in config.json!!!! 

    // have window.addEventListener add args to an array, if args contain function,
    // create a new proxy for func
    buffer += 
    `try {
        window.addEventListener = new Proxy(window.addEventListener, {
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
                console.log("window.addEventListener API invoked with args", chrome.runtime.id, Date.now(), pc, args_to_strings);
                pc += 1;
                //if window.addEventListener is called with a function
                if (args.length >= 2){
                    try {
                        args[1] = new Proxy(args[1], {
                            apply: function(target2, thisArg2, args2) {
                                console.log("function called with args", chrome.runtime.id, Date.now(), pc, args2);
                                pc += 1;
                                return target2.apply(thisArg2, args2);
                            }
                        })
                    } catch (e) {};
                }
                return target.apply(thisArg, args);
            }
        })
    } catch(e) {};
    `
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
                    console.log("${config.content_scripts_to_proxy[i]} API invoked with args", chrome.runtime.id, Date.now(), pc, args_to_strings);
                    pc += 1;
                    return target.apply(thisArg, args);
                }
            })
        } catch(e) {}`;
        
        buffer += temp;
    }
    fs.writeFileSync("proxy_content_script.js", buffer);
})();