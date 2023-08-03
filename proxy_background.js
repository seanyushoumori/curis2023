var proxied_data = [];
var api_call_count = {
"chrome.webRequest.onHeadersReceived.addListener API invoked with args": 0,
"chrome.webRequest.onBeforeRequest.addListener": 0,
"chrome.webRequest.onBeforeSendHeaders.addListener": 0,
"chrome.webRequest.onSendHeaders.addListener" : 0,
"chrome.webRequest.onBeforeRedirect.addListener" : 0,
"chrome.webRequest.onResponseStarted.addListener" : 0,
"chrome.webRequest.onCompleted.addListener" : 0,
"chrome.tabs.create" : 0,
"chrome.tabs.executeScript" : 0,
"chrome.tabs.sendMessage" : 0,
"chrome.tabs.reload" : 0,
"chrome.tabs.get" : 0,
"chrome.tabs.onUpdated.addListener" : 0,
"chrome.tabs.onCreated.addListener" : 0,
"chrome.tabs.onActivated.addListener" : 0,
"chrome.runtime.onMessage.addListener" : 0,
"chrome.runtime.onConnect.addListener" : 0,
}
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
            api_call_count["chrome.webRequest.onHeadersReceived.addListener"] += 1;
            //proxied_data.push("test!")
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}
try {
    chrome.webRequest.onSendHeaders.addListener = new Proxy(chrome.webRequest.onSendHeaders.addListener, {
        apply: function(target, thisArg, args) {
            proxied_data.push(args);
            api_call_count["chrome.webRequest.onSendHeaders.addListener"] += 1;
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}
try {
    chrome.webRequest.onBeforeRedirect.addListener = new Proxy(chrome.webRequest.onBeforeRedirect.addListener, {
        apply: function(target, thisArg, args) {
            proxied_data.push(args);
            api_call_count["chrome.webRequest.onBeforeRedirect.addListener"] += 1;
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}
try {
    chrome.webRequest.onResponseStarted.addListener = new Proxy(chrome.webRequest.onResponseStarted.addListener, {
        apply: function(target, thisArg, args) {
            proxied_data.push(args);
            api_call_count["chrome.webRequest.onResponseStarted.addListener"] += 1;
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}
try {
    chrome.webRequest.onCompleted.addListener = new Proxy(chrome.webRequest.onCompleted.addListener, {
        apply: function(target, thisArg, args) {
            proxied_data.push(args);
            api_call_count["chrome.webRequest.onCompleted.addListener"] += 1;
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}

try {
    chrome.tabs.create = new Proxy(chrome.tabs.create, {
        apply: function(target, thisArg, args) {
            proxied_data.push(args);
            api_call_count["chrome.tabs.create"] += 1;
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}
try {
    chrome.tabs.executeScript = new Proxy(chrome.tabs.executeScript, {
        apply: function(target, thisArg, args) {
            proxied_data.push(args);
            api_call_count["chrome.tabs.executeScript"] += 1;
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}
try {
    chrome.tabs.sendMessage = new Proxy(chrome.tabs.sendMessage, {
        apply: function(target, thisArg, args) {
            proxied_data.push(args);
            api_call_count["chrome.tabs.sendMessage"] += 1;
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}
try {
    chrome.tabs.reload = new Proxy(chrome.tabs.reload, {
        apply: function(target, thisArg, args) {
            proxied_data.push(args);
            api_call_count["chrome.tabs.reload"] += 1;
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}
try {
    chrome.tabs.get = new Proxy(chrome.tabs.get, {
        apply: function(target, thisArg, args) {
            proxied_data.push(args);
            api_call_count["chrome.tabs.get"] += 1;
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}
try {
    chrome.tabs.onUpdated.addListener = new Proxy(chrome.tabs.onUpdated.addListener, {
        apply: function(target, thisArg, args) {
            proxied_data.push(args);
            api_call_count["chrome.tabs.onUpdated.addListener"] += 1;
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}
try {
    chrome.tabs.onCreated.addListener = new Proxy(chrome.tabs.onCreated.addListener, {
        apply: function(target, thisArg, args) {
            proxied_data.push(args);
            api_call_count["chrome.tabs.onCreated.addListener"] += 1;
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}
try {
    chrome.tabs.onActivated.addListener = new Proxy(chrome.tabs.onActivated.addListener, {
        apply: function(target, thisArg, args) {
            proxied_data.push(args);
            api_call_count["chrome.tabs.onActivated.addListener"] += 1;
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}
try {
    chrome.runtime.onMessage.addListener = new Proxy(chrome.runtime.onMessage.addListener, {
        apply: function(target, thisArg, args) {
            proxied_data.push(args);
            api_call_count["chrome.runtime.onMessage.addListener"] += 1;
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}
try {
    chrome.runtime.onConnect.addListener = new Proxy(chrome.runtime.onConnect.addListener, {
        apply: function(target, thisArg, args) {
            proxied_data.push(args);
            api_call_count["chrome.runtime.onConnect.addListener"] += 1;
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}



