const speaker = require("text-to-mp3");
let fs = require('fs');

exports.read = async (text) => {
    return await speaker.getMp3(text, function (err, binaryStream) {
        if (err) {
            console.log(err);
            return;
        }
        let file = fs.createWriteStream("yourtext.mp3");
        file.write(binaryStream);
        file.end();
    });
}

