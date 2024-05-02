import os
import json
import requests

#these two might be different, extension location contains extensions that are deprecated and no longer exist
#extension names is only extensions that currently are on the CWS
extension_location = '/Users/sean/Downloads/Extensions:Research/vulnerable-extensions/extension-set'
extension_names_location = 'doubleX_extensions_still_exist.json'

with open(extension_names_location, 'r') as file:
    content = file.read()
    extension_names = json.loads(content)

for extension_name in extension_names:
    with open(extension_location + '/' + extension_name + '/manifest.json', 'r') as file:
        content = file.read()
        manifest_file = json.loads(content)
    if "permissions" in manifest_file.keys():
        #permissions is an array
        permissions = manifest_file["permissions"]
        if "tabs" in permissions:
            print(extension_name)
