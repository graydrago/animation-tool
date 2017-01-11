import * as static_module from "node-static";
import * as fs from "fs";
import * as qs from "querystring";

const WORK_DIR = "./build/public/work_dir";
const IMG_DIR = `${WORK_DIR}/img`;
const SCRIPT_DIR = `${WORK_DIR}/scripts`;

var file = new static_module.Server('./build/public');

function init() {
  // create work directory if necessary
  if (!fs.existsSync(WORK_DIR)) {
    fs.mkdirSync(WORK_DIR);
  }

  if (!fs.existsSync(IMG_DIR)) {
    fs.mkdirSync(IMG_DIR);
  }

  if (!fs.existsSync(SCRIPT_DIR)) {
    fs.mkdirSync(SCRIPT_DIR);
  }

  console.log("Server status: inited");
}

function saveImageToWorkDir(fileName: string, binary_data: string) {
  fs.writeFileSync(`${IMG_DIR}/${fileName}`, binary_data);
}

init();
require('http').createServer(function (request, response) {
  let full_body = '';
  request
    .addListener('end', () => {
      if (request.url.startsWith("/ajax")) {
        if (full_body) {
          saveImageToWorkDir("box.svg", full_body);
          response.end(JSON.stringify({status: 'saved'}));
        } else {
          response.end(JSON.stringify({status: 'bad request'}));
        }
      } else {
        file.serve(request, response);
      }
    })
    .addListener('data', (chunk) => {
      if (request.url.startsWith('/ajax')) {
        full_body += chunk.toString();
      }
    })
    .resume();
}).listen(8080);
