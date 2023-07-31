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
            return target.apply(thisArg, args);
        }
    });
} catch(e) {}
//setTimeout(() => {console.log("sleeping!\n")}, 5000);
//console.log("test!" + chrome.runtime.id)
