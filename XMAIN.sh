mitmdump -s ./mitmproxy-script.py &
rm -r cexts
mkdir -p cexts/crxs cexts/zips cexts/unzips
mkdir -p results
node make_proxies.js
# node test_extensions_framework.js
node test_extensions_framework.js main_commands.sh
parallel -j8 -a main_commands.sh