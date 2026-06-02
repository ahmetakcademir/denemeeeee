const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

// Force production environment
process.env.NODE_ENV = "production";

console.log("NARD Server: Initializing programmatic Next.js production server...");

const dev = false;
const app = next({ dev });
const handle = app.getRequestHandler();

// Hostinger/Phusion Passenger passes a Unix domain socket path in process.env.PORT.
// Standard Node.js server.listen() supports both socket paths and numeric ports natively.
// We avoid parseInt() to preserve socket paths.
const port = process.env.PORT || 3000;
console.log(`NARD Server: Target port or socket binding: ${port}`);

app.prepare()
  .then(() => {
    console.log("NARD Server: App preparation successful. Creating HTTP server...");
    
    const server = createServer((req, res) => {
      console.log(`NARD Request: ${req.method} ${req.url} - Headers: ${JSON.stringify(req.headers)}`);
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    });

    server.listen(port, (err) => {
      if (err) {
        console.error("NARD Server: Critical listener crash:", err);
        throw err;
      }
      console.log(`NARD Server: Ready and successfully bound to: ${port}`);
    });
  })
  .catch((err) => {
    console.error("NARD Server: Critical app preparation failure:", err);
    process.exit(1);
  });

