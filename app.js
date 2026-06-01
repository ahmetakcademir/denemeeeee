const { exec } = require("child_process");

console.log("NARD Server: Initializing Next.js production server via sub-process...");

// Resolve dynamic port binding requested by Hostinger hPanel/Passenger
const port = process.env.PORT || 3000;
console.log(`NARD Server: Target binding port detected: ${port}`);

// Launch 'next start' inside a child process
const nextProcess = exec(`npx next start -p ${port}`);

nextProcess.stdout.on("data", (data) => {
  console.log(`[Next.js STDOUT]: ${data}`);
});

nextProcess.stderr.on("data", (data) => {
  console.error(`[Next.js STDERR]: ${data}`);
});

nextProcess.on("close", (code) => {
  console.log(`NARD Server: Next.js process exited with code ${code}`);
});
