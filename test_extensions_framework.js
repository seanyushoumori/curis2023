const assert = require('node:assert');
const process = require('process');
const { chromium, devices } = require('playwright');
const fs = require("fs");
const { chrome } = require('node:process');
const { execSync } = require('node:child_process');
const { type } = require('node:os');

const cmds = [];

(async() =>{
    const config = JSON.parse(fs.readFileSync('config.json'));
    const extensions_list = Object.values(JSON.parse(fs.readFileSync(config.extensions_list_location)));
    for (let i = 0; i < extensions_list.length; i++){
        cmds.push(`node test_popular_chrome_extensions.js ${extensions_list[i]}`);
    }
    fs.writeFileSync(process.argv[2] || "main_commands.sh", cmds.join("\n"));
    process.exit();

})();   