import * as static_module from "node-static";
import * as fs from "fs";
import * as qs from "querystring";
import * as http from "http";

const WORK_DIR = "./build/public/work_dir";
const IMG_DIR = `${WORK_DIR}/img`;
const SCRIPT_DIR = `${WORK_DIR}/scripts`;
const ANIMS_DIR = `${WORK_DIR}/animations`;

var file = new static_module.Server('./build/public');

function init() {
  if (!fs.existsSync(WORK_DIR)) {
    fs.mkdirSync(WORK_DIR);
  }

  if (!fs.existsSync(IMG_DIR)) {
    fs.mkdirSync(IMG_DIR);
  }

  if (!fs.existsSync(SCRIPT_DIR)) {
    fs.mkdirSync(SCRIPT_DIR);
  }

  if (!fs.existsSync(ANIMS_DIR)) {
    fs.mkdirSync(ANIMS_DIR);
  }

  console.log("Server status: inited");
}

function saveImageToWorkDir(fileName: string, binary_data: string) {
  fs.writeFileSync(`${IMG_DIR}/${fileName}`, binary_data);
}

function saveAnamationToAnimationsDir(fileName: string, data: string) {
  fs.writeFileSync(`${ANIMS_DIR}/${fileName}`, data);
}

init();
require('http').createServer(function (request: http.IncomingMessage, response: http.ServerResponse) {
  let full_body = '';
  request
    .addListener('end', () => {
      response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      response.setHeader("Pragma", "no-cache");
      response.setHeader("Expires", "0");

      if (request.url.startsWith("/uploadfile")) {
        console.log(request.headers["x-file-name"]);
        if (full_body) {
          saveImageToWorkDir(request.headers["x-file-name"], full_body);
          response.end(JSON.stringify({status: 'file saved'}));
        } else {
          response.end(JSON.stringify({status: 'bad request'}));
        }
      } else if (request.url.startsWith("/uploadjson")) {
        if (full_body) {
          saveAnamationToAnimationsDir("animation.json", full_body);
          response.end(JSON.stringify({status: 'animation saved'}));
        } else {
          response.end(JSON.stringify({status: 'bad request'}));
        }
      } else {
        file.serve(request, response);
      }
    })
    .addListener('data', (chunk) => {
      if (request.url.startsWith('/uploadfile') || request.url.startsWith('/uploadjson')) {
        full_body += chunk.toString();
      }
    })
    .resume();
}).listen(8080);
