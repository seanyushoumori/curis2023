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
            proxied_data.push("test!")
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}


