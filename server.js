const net = require('net');
const fs = require("fs");
const path = require('path');

const qa = require("./qa");
const port = 8124;

let i = 1;
let sockets = [];
let files = [];
if (!fs.existsSync("./qa.json")) {
	console.log("no json");
	return;
}

const server = net.createServer(client => {
    client.id = Date.now() + i;
    i++;
    console.log(`Client id = ${client.id} connected`);
    let isQA = false;
    let isFILES = false;

    sockets.push(client);
    client.setEncoding('utf8');

    client.on("data", data => {
      if(data === qa.files){
        files[client.id] = [];
        fs.mkdir("./DirForFile" + path.sep + client.id, function (err) {
          if (err) {
              console.log("mkdir error " + err);
          }
        });
        isFILES = true;
        client.write(qa.ask, "UTF-8");
      }
      else if(data !== qa.files && isFILES){
        files[client.id].push(data.toString());
        if (data.toString().endsWith("FILE{")) {
          let info = files[client.id].toString().split('{');
          info.pop();
          let buffer = Buffer.from(info[0], 'base64');
          let FileName = info[1].substring(1, info[1].length);
          //FileName.splice(FileName.indexOf(","), 1);
          fs.writeFile("./DirForFile" + path.sep + client.id + path.sep + FileName, buffer.toString(), function () {
              info = [];
              files[client.id] = [];
              client.write(`File saved`);
              console.log(`File ${FileName} save`);
          });
        }
      }
    });
      
      client.on("end", () => {
        sockets = sockets.filter(socket => socket.id !== client.id);
        console.log(`Client id = ${client.id} disconnected`)
      });
    });
    

    server.listen(port, () => {
      console.log(`Server listening on localhost:${port}`);
    });