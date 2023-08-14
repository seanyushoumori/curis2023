"""
Read a mitmproxy dump file.
"""
from mitmproxy import io, http
from mitmproxy.exceptions import FlowReadException
import sys



logfile = open("/Users/sean/Downloads/Extensions:Research/test-download.mitm", "rb")
#dictionary of URLs mapped to their responses
responses = dict()
freader = io.FlowReader(logfile)

for f in freader.stream():
    if isinstance(f, http.HTTPFlow):
        URL = f.request.url
        if URL not in responses:
            
            if isinstance(f, http.Response):
                response = http.Response.make(
                    f.response.status_code,
                    f.response.content,
                    f.response.headers,
                )
            responses[URL] = response
    





"""
Send a reply from the proxy without sending any data to the remote server.
"""

def request(flow: http.HTTPFlow) -> None:
    if flow.request.url in responses:
        flow.response = responses[flow.request.url]
        print("replaced!\n")