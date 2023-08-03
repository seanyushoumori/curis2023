/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var CryptoJS = CryptoJS || function(h, s) {
    var f = {},
        t = f.lib = {},
        g = function() {},
        j = t.Base = {
            extend: function(a) {
                g.prototype = this;
                var c = new g;
                a && c.mixIn(a);
                c.hasOwnProperty("init") || (c.init = function() {
                    c.$super.init.apply(this, arguments)
                });
                c.init.prototype = c;
                c.$super = this;
                return c
            },
            create: function() {
                var a = this.extend();
                a.init.apply(a, arguments);
                return a
            },
            init: function() {},
            mixIn: function(a) {
                for (var c in a) a.hasOwnProperty(c) && (this[c] = a[c]);
                a.hasOwnProperty("toString") && (this.toString = a.toString)
            },
            clone: function() {
                return this.init.prototype.extend(this)
            }
        },
        q = t.WordArray = j.extend({
            init: function(a, c) {
                a = this.words = a || [];
                this.sigBytes = c != s ? c : 4 * a.length
            },
            toString: function(a) {
                return (a || u)
                    .stringify(this)
            },
            concat: function(a) {
                var c = this.words,
                    d = a.words,
                    b = this.sigBytes;
                a = a.sigBytes;
                this.clamp();
                if (b % 4)
                    for (var e = 0; e < a; e++) c[b + e >>> 2] |= (d[e >>> 2] >>> 24 - 8 * (e % 4) & 255) << 24 - 8 * ((b + e) % 4);
                else if (65535 < d.length)
                    for (e = 0; e < a; e += 4) c[b + e >>> 2] = d[e >>> 2];
                else c.push.apply(c, d);
                this.sigBytes += a;
                return this
            },
            clamp: function() {
                var a = this.words,
                    c = this.sigBytes;
                a[c >>> 2] &= 4294967295 <<
                    32 - 8 * (c % 4);
                a.length = h.ceil(c / 4)
            },
            clone: function() {
                var a = j.clone.call(this);
                a.words = this.words.slice(0);
                return a
            },
            random: function(a) {
                for (var c = [], d = 0; d < a; d += 4) c.push(4294967296 * h.random() | 0);
                return new q.init(c, a)
            }
        }),
        v = f.enc = {},
        u = v.Hex = {
            stringify: function(a) {
                var c = a.words;
                a = a.sigBytes;
                for (var d = [], b = 0; b < a; b++) {
                    var e = c[b >>> 2] >>> 24 - 8 * (b % 4) & 255;
                    d.push((e >>> 4)
                        .toString(16));
                    d.push((e & 15)
                        .toString(16))
                }
                return d.join("")
            },
            parse: function(a) {
                for (var c = a.length, d = [], b = 0; b < c; b += 2) d[b >>> 3] |= parseInt(a.substr(b,
                    2), 16) << 24 - 4 * (b % 8);
                return new q.init(d, c / 2)
            }
        },
        k = v.Latin1 = {
            stringify: function(a) {
                var c = a.words;
                a = a.sigBytes;
                for (var d = [], b = 0; b < a; b++) d.push(String.fromCharCode(c[b >>> 2] >>> 24 - 8 * (b % 4) & 255));
                return d.join("")
            },
            parse: function(a) {
                for (var c = a.length, d = [], b = 0; b < c; b++) d[b >>> 2] |= (a.charCodeAt(b) & 255) << 24 - 8 * (b % 4);
                return new q.init(d, c)
            }
        },
        l = v.Utf8 = {
            stringify: function(a) {
                try {
                    return decodeURIComponent(escape(k.stringify(a)))
                } catch (c) {
                    throw Error("Malformed UTF-8 data");
                }
            },
            parse: function(a) {
                return k.parse(unescape(encodeURIComponent(a)))
            }
        },
        x = t.BufferedBlockAlgorithm = j.extend({
            reset: function() {
                this._data = new q.init;
                this._nDataBytes = 0
            },
            _append: function(a) {
                "string" == typeof a && (a = l.parse(a));
                this._data.concat(a);
                this._nDataBytes += a.sigBytes
            },
            _process: function(a) {
                var c = this._data,
                    d = c.words,
                    b = c.sigBytes,
                    e = this.blockSize,
                    f = b / (4 * e),
                    f = a ? h.ceil(f) : h.max((f | 0) - this._minBufferSize, 0);
                a = f * e;
                b = h.min(4 * a, b);
                if (a) {
                    for (var m = 0; m < a; m += e) this._doProcessBlock(d, m);
                    m = d.splice(0, a);
                    c.sigBytes -= b
                }
                return new q.init(m, b)
            },
            clone: function() {
                var a = j.clone.call(this);
                a._data = this._data.clone();
                return a
            },
            _minBufferSize: 0
        });
    t.Hasher = x.extend({
        cfg: j.extend(),
        init: function(a) {
            this.cfg = this.cfg.extend(a);
            this.reset()
        },
        reset: function() {
            x.reset.call(this);
            this._doReset()
        },
        update: function(a) {
            this._append(a);
            this._process();
            return this
        },
        finalize: function(a) {
            a && this._append(a);
            return this._doFinalize()
        },
        blockSize: 16,
        _createHelper: function(a) {
            return function(c, d) {
                return (new a.init(d))
                    .finalize(c)
            }
        },
        _createHmacHelper: function(a) {
            return function(c, d) {
                return (new w.HMAC.init(a,
                        d))
                    .finalize(c)
            }
        }
    });
    var w = f.algo = {};
    return f
}(Math);
(function(h) {
    for (var s = CryptoJS, f = s.lib, t = f.WordArray, g = f.Hasher, f = s.algo, j = [], q = [], v = function(a) {
            return 4294967296 * (a - (a | 0)) | 0
        }, u = 2, k = 0; 64 > k;) {
        var l;
        a: {
            l = u;
            for (var x = h.sqrt(l), w = 2; w <= x; w++)
                if (!(l % w)) {
                    l = !1;
                    break a
                } l = !0
        }
        l && (8 > k && (j[k] = v(h.pow(u, 0.5))), q[k] = v(h.pow(u, 1 / 3)), k++);
        u++
    }
    var a = [],
        f = f.SHA256 = g.extend({
            _doReset: function() {
                this._hash = new t.init(j.slice(0))
            },
            _doProcessBlock: function(c, d) {
                for (var b = this._hash.words, e = b[0], f = b[1], m = b[2], h = b[3], p = b[4], j = b[5], k = b[6], l = b[7], n = 0; 64 > n; n++) {
                    if (16 > n) a[n] =
                        c[d + n] | 0;
                    else {
                        var r = a[n - 15],
                            g = a[n - 2];
                        a[n] = ((r << 25 | r >>> 7) ^ (r << 14 | r >>> 18) ^ r >>> 3) + a[n - 7] + ((g << 15 | g >>> 17) ^ (g << 13 | g >>> 19) ^ g >>> 10) + a[n - 16]
                    }
                    r = l + ((p << 26 | p >>> 6) ^ (p << 21 | p >>> 11) ^ (p << 7 | p >>> 25)) + (p & j ^ ~p & k) + q[n] + a[n];
                    g = ((e << 30 | e >>> 2) ^ (e << 19 | e >>> 13) ^ (e << 10 | e >>> 22)) + (e & f ^ e & m ^ f & m);
                    l = k;
                    k = j;
                    j = p;
                    p = h + r | 0;
                    h = m;
                    m = f;
                    f = e;
                    e = r + g | 0
                }
                b[0] = b[0] + e | 0;
                b[1] = b[1] + f | 0;
                b[2] = b[2] + m | 0;
                b[3] = b[3] + h | 0;
                b[4] = b[4] + p | 0;
                b[5] = b[5] + j | 0;
                b[6] = b[6] + k | 0;
                b[7] = b[7] + l | 0
            },
            _doFinalize: function() {
                var a = this._data,
                    d = a.words,
                    b = 8 * this._nDataBytes,
                    e = 8 * a.sigBytes;
                d[e >>> 5] |= 128 << 24 - e % 32;
                d[(e + 64 >>> 9 << 4) + 14] = h.floor(b / 4294967296);
                d[(e + 64 >>> 9 << 4) + 15] = b;
                a.sigBytes = 4 * d.length;
                this._process();
                return this._hash
            },
            clone: function() {
                var a = g.clone.call(this);
                a._hash = this._hash.clone();
                return a
            }
        });
    s.SHA256 = g._createHelper(f);
    s.HmacSHA256 = g._createHmacHelper(f)
})(Math);





/**
 * (c) 2013 Rob Wu <rob@robwu.nl>
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/* exported openCRXasZip */
/* jshint browser:true, devel:true */
/* globals CryptoJS */ // For sha256 hash calculation
/* globals get_equivalent_download_url */
'use strict';
// Strips CRX headers from zip
// Input: Anything that is accepted by the Uint8Array constructor.
// Output: Blob (to callback)
var CRXtoZIP = (function() {
    function CRXtoZIP(arraybuffer, callback, errCallback) {
        // Definition of crx format: http://developer.chrome.com/extensions/crx.html
        var view = new Uint8Array(arraybuffer);
        // 50 4b 03 04
        if (view[0] === 80 && view[1] === 75 && view[2] === 3 && view[3] === 4) {
            console.warn('Input is not a CRX file, but a ZIP file.');
            callback(new Blob([arraybuffer], {
                type: 'application/zip'
            }), undefined);
            return;
        }
        // 43 72 32 34
        if (view[0] !== 67 || view[1] !== 114 || view[2] !== 50 || view[3] !== 52) {
            if (isMaybeZipData(view)) {
                console.warn('Input is not a CRX file, but possibly a ZIP file.');
                callback(new Blob([arraybuffer], {
                    type: 'application/zip'
                }), undefined);
                return;
            }
            errCallback('Invalid header: Does not start with Cr24.');
            return;
        }
        // 02 00 00 00
        // 03 00 00 00 CRX3
        if (view[4] !== 2 && view[4] !== 3 || view[5] || view[6] || view[7])
            return errCallback('Unexpected crx format version number.'), void 0;
        var zipStartOffset, publicKeyBase64;
        if (view[4] === 2) {
            var publicKeyLength = calcLength(view[8], view[9], view[10], view[11]);
            var signatureLength = calcLength(view[12], view[13], view[14], view[15]);
            // 16 = Magic number (4), CRX format version (4), lengths (2x4)
            zipStartOffset = 16 + publicKeyLength + signatureLength;
            // Public key
            publicKeyBase64 = btoa(getBinaryString(view, 16, 16 + publicKeyLength));
        } else { // view[4] === 3
            // CRX3 - https://cs.chromium.org/chromium/src/components/crx_file/crx3.proto
            var crx3HeaderLength = calcLength(view[8], view[9], view[10], view[11]);
            // 12 = Magic number (4), CRX format version (4), header length (4)
            zipStartOffset = 12 + crx3HeaderLength;
            // Public key
            publicKeyBase64 = getPublicKeyFromProtoBuf(view, 12, zipStartOffset);
        }
        // addons.opera.com creates CRX3 files by prepending the CRX3 header to the CRX2 data.
        if (
            // CRX3
            view[4] === 3 &&
            // 43 72 32 34 - Cr24 = CRX magic
            view[zipStartOffset + 0] === 67 &&
            view[zipStartOffset + 1] === 114 &&
            view[zipStartOffset + 2] === 50 &&
            view[zipStartOffset + 3] === 52
        ) {
            console.warn('Nested CRX: Expected zip data, but found another CRX file instead.');
            return CRXtoZIP(
                arraybuffer.slice(zipStartOffset),
                function(zipFragment, nestedKey) {
                    if (publicKeyBase64 != nestedKey) {
                        console.warn('Nested CRX: pubkey mismatch; found ' + nestedKey);
                    }
                    callback(zipFragment, publicKeyBase64, arraybuffer);
                },
                errCallback
            );
        }
        // Create a new view for the existing buffer, and wrap it in a Blob object.
        var zipFragment = new Blob([
            new Uint8Array(arraybuffer, zipStartOffset)
        ], {
            type: 'application/zip'
        });
        callback(zipFragment, publicKeyBase64, arraybuffer);
    }
    function calcLength(a, b, c, d) {
        var length = 0;
        length += a << 0;
        length += b << 8;
        length += c << 16;
        length += d << 24 >>> 0;
        return length;
    }
    function getBinaryString(bytesView, startOffset, endOffset) {
        var binaryString = '';
        for (var i = startOffset; i < endOffset; ++i) {
            binaryString += String.fromCharCode(bytesView[i]);
        }
        return binaryString;
    }
    function getPublicKeyFromProtoBuf(bytesView, startOffset, endOffset) {
        // Protobuf definition: https://cs.chromium.org/chromium/src/components/crx_file/crx3.proto
        // Wire format: https://developers.google.com/protocol-buffers/docs/encoding
        // The top-level CrxFileHeader message only contains length-delimited fields (type 2).
        // To find the public key:
        // 1. Look for CrxFileHeader.sha256_with_rsa (field number 2).
        // 2. Look for AsymmetricKeyProof.public_key (field number 1).
        // 3. Look for CrxFileHeader.signed_header_data (SignedData.crx_id).
        //    This has 16 bytes (128 bits). Verify that those match with the
        //    first 128 bits of the sha256 hash of the chosen public key.
        function getvarint() {
            // Note: We don't do bound checks (startOffset < endOffset) here,
            // because even if we read past the end of bytesView, then we get
            // the undefined value, which is converted to 0 when we do a
            // bitwise operation in JavaScript.
            var val = bytesView[startOffset] & 0x7F;
            if (bytesView[startOffset++] < 0x80) return val;
            val |= (bytesView[startOffset] & 0x7F) << 7;
            if (bytesView[startOffset++] < 0x80) return val;
            val |= (bytesView[startOffset] & 0x7F) << 14;
            if (bytesView[startOffset++] < 0x80) return val;
            val |= (bytesView[startOffset] & 0x7F) << 21;
            if (bytesView[startOffset++] < 0x80) return val;
            val = (val | (bytesView[startOffset] & 0xF) << 28) >>> 0;
            if (bytesView[startOffset++] & 0x80) console.warn('proto: not a uint32');
            return val;
        }
        var publicKeys = [];
        var crxIdBin;
        while (startOffset < endOffset) {
            var key = getvarint();
            var length = getvarint();
            if (key === 80002) { // This is ((10000 << 3) | 2) (signed_header_data).
                var sigdatakey = getvarint();
                var sigdatalen = getvarint();
                if (sigdatakey !== 0xA) {
                    console.warn('proto: Unexpected key in signed_header_data: ' + sigdatakey);
                } else if (sigdatalen !== 16) {
                    console.warn('proto: Unexpected signed_header_data length ' + length);
                } else if (crxIdBin) {
                    console.warn('proto: Unexpected duplicate signed_header_data');
                } else {
                    crxIdBin = bytesView.subarray(startOffset, startOffset + 16);
                }
                startOffset += sigdatalen;
                continue;
            }
            if (key !== 0x12) {
                // Likely 0x1a (sha256_with_ecdsa).
                if (key != 0x1a) {
                    console.warn('proto: Unexpected key: ' + key);
                }
                startOffset += length;
                continue;
            }
            // Found 0x12 (sha256_with_rsa); Look for 0xA (public_key).
            var keyproofend = startOffset + length;
            var keyproofkey = getvarint();
            var keyprooflength = getvarint();
            // AsymmetricKeyProof could contain 0xA (public_key) or 0x12 (signature).
            if (keyproofkey === 0x12) {
                startOffset += keyprooflength;
                if (startOffset >= keyproofend) {
                    // signature without public_key...? The protocol definition allows it...
                    continue;
                }
                keyproofkey = getvarint();
                keyprooflength = getvarint();
            }
            if (keyproofkey !== 0xA) {
                startOffset += keyprooflength;
                console.warn('proto: Unexpected key in AsymmetricKeyProof: ' + keyproofkey);
                continue;
            }
            if (startOffset + keyprooflength > endOffset) {
                console.warn('proto: size of public_key field is too large');
                break;
            }
            // Found 0xA (public_key).
            publicKeys.push(getBinaryString(bytesView, startOffset, startOffset + keyprooflength));
            startOffset = keyproofend;
        }
        if (!publicKeys.length) {
            console.warn('proto: Did not find any public key');
            return;
        }
        if (!crxIdBin) {
            console.warn('proto: Did not find crx_id');
            return;
        }
        var crxIdHex = CryptoJS.enc.Latin1.parse(getBinaryString(crxIdBin, 0, 16))
            .toString();
        for (var i = 0; i < publicKeys.length; ++i) {
            var sha256sum = CryptoJS.SHA256(CryptoJS.enc.Latin1.parse(publicKeys[i]))
                .toString();
            if (sha256sum.slice(0, 32) === crxIdHex) {
                return btoa(publicKeys[i]);
            }
        }
        console.warn('proto: None of the public keys matched with crx_id');
    }
    function isMaybeZipData(view) {
        // Find EOCD (0xFFFF is the maximum size of an optional trailing comment).
        for (var i = view.length - 22, ii = Math.max(0, i - 0xFFFF); i >= ii; --i) {
            if (view[i] === 0x50 && view[i + 1] === 0x4b &&
                view[i + 2] === 0x05 && view[i + 3] === 0x06) {
                return true;
            }
        }
        return false;
    }
    return CRXtoZIP;
})();



function computeExtensionPubKey(xbuf, zipout) {
    return new Promise((resolve, reject) => {
        try {
            CRXtoZIP(xbuf, (xzip, pubkey, fbuf) => {
                try {
                    if (zipout)
                        fs.writeFileSync(zipout, fbuf);
                } catch(e) {}
                resolve(pubkey);
            }, (err) => {
                reject('')
            })
        } catch(e) {
            reject('')
        }
    })
}

function generateCRXDownload(extid) {
    return 'curl -s -o ' + crxs + extid + '.crx -L "https://clients2.google.com/service/update2/crx?response=redirect&prodversion=115.0.0.0&x=id%3D' + extid + '%26installsource%3Dondemand%26uc"'
}

function genUnzipCmd() {
    return "unzip -oqq " + basext + extension + ".zip -d " + unzipdir + extension;
}



function runCommand(cmd) {
    return cp.execSync(cmd);
}


const fs = require('fs');
const cp = require('child_process');




( async () => {
    const zips   = 'cexts/zips/', // make sure these folders exist
    crxs   = 'cexts/crxs/', 
    unzips = 'cexts/unzips/',
    extid = process.argv[2]; // i.e. cjpalhdlnbpafiamejdnhcphjbkeiagm
    try {
        // Download the extension CRX file
        let crx_cmd = 'curl -s -o ' + crxs + extid + '.crx -L "https://clients2.google.com/service/update2/crx?response=redirect&os=linux&arch=x86-64&os_arch=x86-64&nacl_arch=x86-64&prod=chromecrx&prodchannel=unknown&prodversion=95.0.4638.54&acceptformat=crx2,crx3&x=id%3D' + extid + '%26uc"'
        //console.log('CRX CMD', crx_cmd);
        runCommand(crx_cmd);
        // Extract Public key and generate zip file
        let xbuf = fs.readFileSync(crxs + extid + '.crx');
        let zipout = zips + extid + '.zip';
        let pubkey = await computeExtensionPubKey(xbuf, zipout);
        // Unzip the extension
        let unzip_cmd = "unzip -oqq " + zips + extid + ".zip -d " + unzips + extid;
        try { runCommand(unzip_cmd); } catch(e) { } // you may get an error, but in most of the cases, it is not important
        // Read manifest
        let manifestPath = unzips + extid + '/manifest.json';
        let manifest = eval('(' + fs.readFileSync(manifestPath).toString() + ')');
        manifest.key = pubkey;
        //console.log(pubkey, manifest, manifestPath);
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 4));     
    } catch(e) {
        console.log("An error occurred while trying to run this code", e);
    }
}) ();


