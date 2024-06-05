const assert = require('node:assert');
const process = require('process');
const { chromium, devices } = require('playwright');
const fs = require("fs");
const { chrome } = require('node:process');
const { execSync } = require('node:child_process');

(async() => {
    const config = JSON.parse(fs.readFileSync('config.json')); 

    /* Below code is to create proxies for service workers */
    var buffer = "var proxied_data = []; var pc = 0; var isGlobal = true;";    
    for (let i = 0; i < config.service_workers_to_proxy.length; i++){
        let temp = 
        `
        try {
            ${config.service_workers_to_proxy[i]} = new Proxy(${config.service_workers_to_proxy[i]}, {
                apply: function(target, thisArg, args) {
                    isGlobal = false;
                    if (args[0] !== null && typeof(args[0]) === 'function'){
                        proxied_data.push(["sub-function", chrome.runtime.id, Date.now(), pc, JSON.stringify(target2), JSON.stringify(thisArg2), isGlobal, "it's a function"]);
                        args[0] = new Proxy(args[0], {
                            apply: function(target2, thisArg2, args2){
                                let args_to_strings2 = [];
                    
                                for (let j = 0; j < args2.length; j++){
                                    if (typeof(args2[j]) === 'object' && args2[j] !== null){
                                        args_to_strings2.push(JSON.stringify(args2[j]));
                                    }
                                    else {
                                        args_to_strings2.push(args2[j]);
                                    }
                                
                                }
                                let temp2 = target2.apply(thisArg2, args2);
                                proxied_data.push(["sub-function", chrome.runtime.id, Date.now(), pc, JSON.stringify(target2), JSON.stringify(thisArg2), isGlobal, args_to_strings2]);  
                                pc += 1;
                                return temp2;
                            }
                        });
                    }
                    let args_to_strings = [];
                    
                    for (let j = 0; j < args.length; j++){
                        if (typeof(args[j]) === 'object' && args[j] !== null){
                            args_to_strings.push(JSON.stringify(args[j]));
                        }
                        else {
                            args_to_strings.push(args[j]);
                        }
                    }
                    let temp = target.apply(thisArg, args); 
                    proxied_data.push(["${config.service_workers_to_proxy[i]}", chrome.runtime.id, Date.now(), pc, JSON.stringify(target), JSON.stringify(thisArg), isGlobal, args_to_strings]);
                    pc += 1;
                    isGlobal = true;
                    return temp;
                }
            });
        } catch(e) {}
        `;
        buffer += temp;
    }
    fs.writeFileSync("proxy_background.js", buffer);


    /* Below code is to create proxies for Content Scripts */
    buffer = `var pc = 0;
    `;
    
    for (let i = 0; i < config.content_scripts_to_proxy.length; i++){
        let temp = 
        `
        try {
            ${config.content_scripts_to_proxy[i]} = new Proxy(${config.content_scripts_to_proxy[i]}, {
                apply: function(target, thisArg, args) {
                    function f(event) {
                        switch(typeof args[1]) {
                            case "function":
                                console.log("addEventListener function called", chrome.runtime.id, Date.now(), pc);
                                pc += 1;
                                return args[1](event);
                            case "object":
                                if(args[1].handleEvent)
                                    return args[1].handleEvent(event);;
                                break;
                            default:
                                break;
                        }
                    }

                    let args_to_strings = JSON.stringify(args);
                    let args_to_dict = {
                        "API": "${config.content_scripts_to_proxy[i]} API invoked with args",
                        "runtime id": chrome.runtime.id, 
                        "time" : Date.now(),
                        "pc": pc, 
                        "target": JSON.stringify(target),
                        "thisArg": JSON.stringify(thisArg), 
                        "args": args,
                    }

                    // console.log("${config.content_scripts_to_proxy[i]} API invoked with args", chrome.runtime.id, Date.now(), pc, JSON.stringify(target.toString()), JSON.stringify(thisArg), args_to_strings);
                    //console.log(JSON.stringify(args_to_dict));
                    console.log(JSON.stringify(args_to_dict))
                    pc += 1;
                    //return target.apply(thisArg, args);
                    return target.apply(thisArg, [args[0], f, args[2] || false]);
                }
            })
        } catch(e) {};
        `;
        
        buffer += temp;
    }
    fs.writeFileSync("proxy_content_script.js", buffer);
})();