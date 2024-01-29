mitmdump -s ./mitmproxy-script.py &
rm -r cexts
mkdir -p cexts/crxs cexts/zips cexts/unzips
mkdir -p results
node make_proxies.js
#node process_extensions.js
node test_extensions_framework.js