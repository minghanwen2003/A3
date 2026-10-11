// Passenger loads the startup file with require(). Import the ESM server after
// Passenger has initialized the Node.js process.
(async () => {
  try {
    await import('./server.js');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
