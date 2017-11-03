const net = require('net');
const fs = require('fs');
const qa = require("./qa");
const path = require("path");
const port = 8124;

const client = new net.Socket();

client.setEncoding('utf8');
let incorrectPaths = true;
paths = process.argv[2];

if (paths == undefined) {
    console.log("Please, input dir path!");
    incorrectPaths = false;
} else {
    if(!fs.existsSync(paths)) {
        console.log("Incorrect dir path!");
        incorrectPaths = false;
    }
}

if(!incorrectPaths) return;

let counter = 0;
let globalFiles;

client.connect(port, function() {
  console.log('Connected');
  client.write(qa.files);
});

client.on('data', data => {
    if(data === qa.ask){
        globalFiles = ListPath(paths);
        sendFiles();
        console.log('first sented')
    }
    else if (counter >= globalFiles.length) {
        client.destroy();
    }
    else if (data === "File saved" && counter !== globalFiles.length) {
        sendFiles();
    }
    else if(data === qa.dec){
        console.log("Server refused");
        client.destroy();
    }
});


client.on('close', () => {
  console.log('Connection closed');
});


const sendFiles = () => { 
    let pathFile = globalFiles[counter];
    counter++;
    console.log(pathFile);
    fs.readFile(pathFile, (err, data) => {
        if (err) {
            console.log("readfile error " + err);
        }
        client.write(data.toString('base64') + '{', function () {
            client.write(path.basename(pathFile) + '{', function () {
                client.write("FILE" + '{', () => {
                });
            });
        });
    });
};

const ListPath = (inputPath, folderName = inputPath, filePathArray = []) => {
    let dir = fs.readdirSync(inputPath);
    let dirPath = path.resolve(inputPath);
    dir.forEach(currentFile => {
        let itemPath = `${dirPath}\\${currentFile}`;
        let stat = fs.statSync(itemPath);
        if (stat && stat.isDirectory()) {
            filePathArray = ListPath.call(
                this,
                itemPath,
                `${folderName}\\${currentFile}`,
                filePathArray.splice(0)
            );
        } else {
            let file = `${folderName}\\${currentFile}`;
            filePathArray.push(file);
        }
    });
    return filePathArray;
}

