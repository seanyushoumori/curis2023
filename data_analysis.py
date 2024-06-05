import os
import json
import glob

results_path = '/Users/sean/Downloads/Extensions:Research/results'
zip_folders = '/Users/sean/Downloads/Extensions:Research/cexts/unzips'
API_call_count = dict()
URL_count = dict()

#API_count is a measure of how many extensions call which APIs, limited to 1 instance per extension
API_count_background = dict()
API_count_content = dict()

# for zip_file in os.listdir(zip_folders):
#     print(zip_file)
#     file_path = os.path.join(zip_folders, zip_file + '/manifest.json')
#     with open(file_path, 'r') as file:
#         content = file.read()
#         parsed_content = json.loads(content)
#         print(parsed_content)
def parse_extension(extension_name, APIs):
    found = set()
    filepath = os.path.join(zip_folders, extension_name)
    # go through manifest file to find all content scripts and all service workers
    with open(filepath + '/manifest.json','r') as file:
        manifest = json.loads(file.read())
        if "background" in manifest.keys():
            if manifest["manifest_version"] == 2:
                background_data = manifest["background"]
                if "scripts" in background_data.keys():
                    background_scripts = background_data["scripts"]
                    for js_filename in background_scripts:
                        if js_filename == "proxy_background.js":
                            continue
                        else:
                            try:
                                with open(os.path.join(filepath, js_filename)) as bs_file:
                                    content = bs_file.read()
                                    for API in APIs:
                                        if API in content:
                                            found.add(API)
                            except:
                                print("the background script" + os.path.join(filepath, js_filename) + " was not found")
            if manifest["manifest_version"] == 3:
                background_data = manifest["background"]
                if "service_worker" in background_data.keys():
                    js_filename = background_data["service_worker"]
                    try:
                        with open(os.path.join(filepath, js_filename)) as bs_file:
                            content = bs_file.read()
                            for API in APIs:
                                if API in content:
                                    found.add(API)
                    except:
                        print("the background script" + os.path.join(filepath, js_filename) + " was not found")

    if found != APIs:
        # print(extension_name)
        # print(APIs - found)
        return False        

    return True

# Analysis of outputted data
#"extension" should be the name of the extension itself
for extension in os.listdir(results_path):
    if extension == ".DS_Store":
        continue
    APIs_called_set_background = set()
    APIs_called_set_content = set()
    for filename in os.listdir(results_path + '/' + extension):
        if "background" in filename:
            file_path = os.path.join(results_path + '/' + extension, filename)
            with open(file_path, 'r') as file:
                content = file.read()
                parsed_content = json.loads(content)
                # print(parsed_content)
                APIs_found = set()
                for data_entry in parsed_content:
                # print(data_entry[0])
                    API = data_entry[0]
                    runtime_id = data_entry[1]
                    date = data_entry[2]
                    pc = data_entry[3]
                    target = data_entry[4]
                    thisArg = data_entry[5]
                    isGlobal = data_entry[6]
                    arguments = data_entry[7]
                    APIs_found.add(API)

                    if API in API_call_count:
                        API_call_count[API] += 1
                    else:
                        API_call_count[API] = 1

                    

                    # print(arguments[0])
                    
                    # print(arguments)
                    # if API == "chrome.tabs.executeScript":
                    #      print(data_entry)
                    APIs_called_set_background.add(API)

                    # if (pc != 0):
                    #     print(extension, API)
                    #     print()

                    if arguments is not None:
                        for argument in arguments:
                            if isinstance(argument, str):
                                if "url" in argument:
                                    try:
                                        arg_to_dict = json.loads(argument)
                                        if 'url' in arg_to_dict:                                            
                                            # print(arg_to_dict['url'])
                                            url = arg_to_dict['url']
                                            if url in URL_count:
                                                URL_count[url] += 1
                                            else:
                                                URL_count[url] = 1
                                        if 'urls' in arg_to_dict:
                                            url_list = arg_to_dict['urls']
                                            for url in url_list:
                                                if url in URL_count: 
                                                    URL_count[url] += 1
                                                else:
                                                    URL_count[url] = 1
                                            # print(type(arg_to_dict['urls']))
                                            # print(arg_to_dict['urls'])
                                    except json.JSONDecodeError:
                                        print()
                # parse_extension(extension, APIs_found)
        elif "content" in filename:
            file_path = os.path.join(results_path + '/' + extension, filename)
            with open(file_path, 'r') as file:
                content = file.read()
                parsed_content = json.loads(content)
                for data_entry in parsed_content:
                    # print(data_entry)
                    try:
                        json_data = json.loads(data_entry)
                        print(json_data["API"])
                    except:
                        print()        
                
                # temp = content.split()
                # print(temp)
                # #print(temp)
                # if (len(temp) > 1):
                #     APIs_called_set_content.add(temp[1][1:])
    
    # print("Extension ID : ", extension)
    # print("Background Script APIs called : ",APIs_called_set_background)            
    # print("Content Script APIs called : ",APIs_called_set_content) 
    # print()
    for API in APIs_called_set_background:
        if API in API_count_background:
            API_count_background[API] += 1
        else:
            API_count_background[API] = 1
    for API in APIs_called_set_content:
        if API in API_count_content:
            API_count_content[API] += 1
        else:
            API_count_content[API] = 1

# print("background:")
# print(API_count_background)
# print("Content Script:")
# print(API_count_content)
# print(URL_count)
# print(API_call_count)
        