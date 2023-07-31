let proxied_data = [];
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
            console.log("chrome.webRequest.onHeadersReceived.addListener API invoked with args", args);
            proxied_data.push(args);
            //proxied_data.push("test!")
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}
try {
    chrome.webRequest.onSendHeaders.addListener = new Proxy(chrome.webRequest.onSendHeaders.addListener, {
        apply: function(target, thisArg, args) {
            proxied_data.push(args);
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}
try {
    chrome.webRequest.onBeforeRedirect.addListener = new Proxy(chrome.webRequest.onBeforeRedirect.addListener, {
        apply: function(target, thisArg, args) {
            proxied_data.push(args);
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}
try {
    chrome.webRequest.onResponseStarted.addListener = new Proxy(chrome.webRequest.onResponseStarted.addListener, {
        apply: function(target, thisArg, args) {
            proxied_data.push(args);
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}
try {
    chrome.webRequest.onCompleted.addListener = new Proxy(chrome.webRequest.onCompleted.addListener, {
        apply: function(target, thisArg, args) {
            proxied_data.push(args);
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}

try {
    chrome.tabs.create = new Proxy(chrome.tabs.create, {
        apply: function(target, thisArg, args) {
            proxied_data.push(args);
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}
try {
    chrome.tabs.executeScript = new Proxy(chrome.tabs.executeScript, {
        apply: function(target, thisArg, args) {
            proxied_data.push(args);
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}
try {
    chrome.tabs.sendMessage = new Proxy(chrome.tabs.sendMessage, {
        apply: function(target, thisArg, args) {
            proxied_data.push(args);
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}
try {
    chrome.tabs.reload = new Proxy(chrome.tabs.reload, {
        apply: function(target, thisArg, args) {
            proxied_data.push(args);
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}
try {
    chrome.tabs.get = new Proxy(chrome.tabs.get, {
        apply: function(target, thisArg, args) {
            proxied_data.push(args);
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}
try {
    chrome.tabs.onUpdated.addListener = new Proxy(chrome.tabs.onUpdated.addListener, {
        apply: function(target, thisArg, args) {
            proxied_data.push(args);
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}
try {
    chrome.tabs.onCreated.addListener = new Proxy(chrome.tabs.onCreated.addListener, {
        apply: function(target, thisArg, args) {
            proxied_data.push(args);
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}
try {
    chrome.tabs.onActivated.addListener = new Proxy(chrome.tabs.onActivated.addListener, {
        apply: function(target, thisArg, args) {
            proxied_data.push(args);
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}
try {
    chrome.runtime.onMessage.addListener = new Proxy(chrome.runtime.onMessage.addListener, {
        apply: function(target, thisArg, args) {
            proxied_data.push(args);
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}
try {
    chrome.runtime.onConnect.addListener = new Proxy(chrome.runtime.onConnect.addListener, {
        apply: function(target, thisArg, args) {
            proxied_data.push(args);
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}



