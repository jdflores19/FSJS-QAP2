// QAP 2
// Joseph Flores
// June 12, 2024

const http = require("http");
const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");

class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

const server = http.createServer((req, res) => {
  let filePath = path.join(
    __dirname,
    "pages",
    req.url === "/" ? "index.html" : req.url + ".html"
  );
  const extname = path.extname(filePath);
  const contentType = "text/html";
  let statusCode = 200;

  if (!extname) {
    filePath += ".html";
  }

  // Check if the file exists
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === "ENOENT") {
        filePath = path.join(__dirname, "pages", "404.html");
        statusCode = 404;
        fs.readFile(filePath, (err, content) => {
          res.writeHead(statusCode, { "Content-Type": contentType });
          res.end(content, "utf8");
          logEvent(`${req.url} resulted in 404`);
        });
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
        logEvent(`Server error: ${err.code}`);
      }
    } else {
      res.writeHead(statusCode, { "Content-Type": contentType });
      res.end(content, "utf8");
      logEvent(`${req.url} served successfully`);
    }
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
  logEvent("Server started on port 3000");
});

myEmitter.on("log", (message) => {
  console.log(message);
  logToFile(message);
});

function logEvent(message) {
  const date = new Date();
  myEmitter.emit("log", `${date.toISOString()} - ${message}`);
}

function logToFile(message) {
  const date = new Date();
  const logFileName = path.join(
    __dirname,
    "logs",
    `${date.toISOString().split("T")[0]}.log`
  );
  fs.appendFile(logFileName, `${message}\n`, (err) => {
    if (err) {
      console.error("Error writing to log file", err);
    }
  });
}
