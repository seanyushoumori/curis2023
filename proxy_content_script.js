
try {
    fetch = new Proxy(fetch, {
        apply: function(target, thisArg, args) {
            console.log("Fetch API invoked with args", args);
            return target.apply(thisArg, args);
        }
    })
} catch(e) {}
try {
    chrome.webRequest.onHeadersReceived.addListener = new Proxy(chrome.webRequest.onHeadersReceived.addListener, {
        apply: function(target, thisArg, args) {
            console.log("chrome.webRequest.onHeadersReceived.addListener API invoked with args", args, chrome.runtime.id);
            
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}

try {
    chrome.runtime.sendMessage = new Proxy(chrome.runtime.sendMessage, {
        apply: function(target, thisArg, args) {
            console.log("chrome.runtime.sendMessage API invoked with args", args, args, chrome.runtime.id);
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}
try {
    chrome.runtime.onMessage.addListener = new Proxy(chrome.runtime.onMessage.addListener, {
        apply: function(target, thisArg, args) {
            console.log("chrome.runtime.onMessage.addListener", args, args, chrome.runtime.id);
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}
try {
    chrome.runtime.onConnect.addListener = new Proxy(chrome.runtime.onConnect.addListener, {
        apply: function(target, thisArg, args) {
            console.log("chrome.runtime.onConnect.addListener API invoked with args", args, args, chrome.runtime.id);
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}
try {
    window.addEventListener = new Proxy(window.addEventListener, {
        apply: function(target, thisArg, args) {
            console.log("window.addEventListener API invoked with args", args, args, chrome.runtime.id);
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}
try {
    document.addEventListener = new Proxy(document.addEventListener, {
        apply: function(target, thisArg, args) {
            console.log("document.addEventListener API invoked with args", args, args, chrome.runtime.id);
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}

