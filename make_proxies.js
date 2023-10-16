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
                    proxied_data.push(["${config.service_workers_to_proxy[i]}", chrome.runtime.id, Date.now(), pc, target, thisArg, args_to_strings]);
                    pc += 1;
                    return target.apply(thisArg, args);
                }
            });
        } catch(e) {}
        `;
        buffer += temp;
    }
    fs.writeFileSync("proxy_background.js", buffer);

    buffer = "var pc = 0;";
    // add window.addEventListener back to content_scripts_to_proxy in config.json!!!! 

    // have window.addEventListener add args to an array, if args contain function,
    // create a new proxy for func



    // buffer += 
    // `
    // try {
    //     window.addEventListener = new Proxy(window.addEventListener, {
    //         apply: function(target, thisArgs, argsList) {
    //             function f(event) {
    //                 switch(typeof argsList[1]) {
    //                     case "function":
    //                         console.log("addEventListener function called", chrome.runtime.id, Date.now(), pc);
    //                         pc += 1;
    //                         return argsList[1](event);
    //                     case "object":
    //                         if(argsList[1].handleEvent)
    //                             return argsList[1].handleEvent(event);;
    //                         break;
    //                     default:
    //                         break;
    //                 }
    //             }
    //             let args_to_strings = [];
    //             for (let j = 0; j < argsList.length; j++){
    //                 if (typeof(argsList[j]) === 'object' && argsList[j] !== null){
    //                     args_to_strings.push(JSON.stringify(argsList[j]));
    //                 }
    //                 else {
    //                     args_to_strings.push(argsList[j]);
    //                 }
    //             }
    //             pc += 1;
    //             console.log("window.addEventListener API invoked with args", chrome.runtime.id, Date.now(), pc, thisArg, args_to_strings);
    //             return target.apply(thisArgs, [argsList[0], f, argsList[2] || false]);
    //         }
    //     });
    // } catch(e) {};
    // `;
    for (let i = 0; i < config.content_scripts_to_proxy.length; i++){
        let temp = 
        `try {
            ${config.content_scripts_to_proxy[i]} = new Proxy(${config.content_scripts_to_proxy[i]}, {
                apply: function(target, thisArg, args) {
                    let args_to_strings = "";
                    //new!!!
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
                    //end new
                    args_to_strings = JSON.stringify(args);
                    console.log("${config.content_scripts_to_proxy[i]} API invoked with args", chrome.runtime.id, Date.now(), pc, target, thisArg, args_to_strings);
                    pc += 1;
                    //return target.apply(thisArg, args);
                    return target.apply(thisArgs, [args[0], f, args[2] || false]);
                }
            })
        } catch(e) {};
        `;
        
        buffer += temp;
    }
    fs.writeFileSync("proxy_content_script.js", buffer);
})();