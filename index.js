let fs = require('fs'),
    request = require('request');

var DEBUGNAME = __filename.slice(__dirname.length + 1, -3);
var debug = require("debug")(DEBUGNAME);

const BASE_URL = "http://translate.google.com/translate_tts?";
var TextToMp3 = function () { }


TextToMp3.prototype.attributes = {
    ie: "UTF-8",
    client: "tw-ob",
    tl: "pt-br"
};

var _parseURL = function (path, text) {

    var keysAtt = Object.keys(TextToMp3.prototype.attributes);
    for (var i = 0; i < keysAtt.length; i++) {
        path += keysAtt[i] + "=" + TextToMp3.prototype.attributes[keysAtt[i]] + "&";
    }
    path += "q=" + text + "&";
    path += "textLen=" + text.length;

    return path;
};

var _writeFile = function (fn, data) {
    if (fn.substring(fn.length - 4, fn.length) !== ".mp3") { 
        fn += ".mp3";
    }
    var file = fs.createWriteStream(fn);
    file.write(data);
    file.end();
    return file.path;
};

TextToMp3.prototype.saveMP3 = function (text, fileName, callback) {

    if (typeof callback !== 'undefined' && typeof (callback) == 'function') {
        TextToMp3.prototype.getMp3(text, function (err, data) {
            if (err)
                return callback(err);

            var file = _writeFile(fileName, data);
            return callback(null, fs.realpathSync(file));
        });
    } else {
        return new Promise(function (resolve, reject) {
            TextToMp3.prototype.getMp3(text).then(function (data) {
                var file = _writeFile(fileName, data);
                resolve(fs.realpathSync(file));
            }).catch(function (err) {
                reject(err);
            });
        });
    }

};

TextToMp3.prototype.getMp3 = function (text, callback) {


    var data = [];

    if (typeof callback !== 'undefined' && typeof (callback) == 'function') {

        if (typeof text === "undefined" || text === "") {
            callback("missing required params");
        }
        var path = _parseURL(BASE_URL, text);
        //debug("PATH", path);
        request
            .get({
                headers: {
                    "Accept-Encoding": "identity;q=1, *;q=0",
                    "Range": "bytes=0-"
                },
                uri: path,
                method: 'GET'
            })
            .on('data', function (chunk) {
                data.push(chunk);
            })
            .on('end', function () {
                callback(null, Buffer.concat(data));

            })
            .on('error', function (err) {
                // handle error
                callback(err);
            });
    } else {
        return new Promise(function (resolve, reject) {

            if (typeof text === "undefined" || text === "") {
                reject("missing required params");
            }
            var path = _parseURL(BASE_URL, text);
            //debug("PATH", path);
            request
                .get({
                    headers: {
                        "Accept-Encoding": "identity;q=1, *;q=0",
                        "Range": "bytes=0-"
                    },
                    uri: path,
                    method: 'GET'
                })
                .on('data', function (chunk) {
                    data.push(chunk);
                })
                .on('end', function () {
                    resolve(Buffer.concat(data));
                })
                .on('error', function (err) {
                    // handle error
                    reject(err);
                });
        });
    }

};

exports.read = async (text) => {
    return await TextToMp3.prototype.getMp3(text, function (err, binaryStream) {
        if (err) {
            console.log(err);
            return;
        }
        let file = fs.createWriteStream("yourtext.mp3");
        file.write(binaryStream);
        file.end();
    });
}