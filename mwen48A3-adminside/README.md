# Admin package

For cPanel Passenger, set the startup file to `passenger.cjs`. It dynamically imports the ES module `server.js` after Passenger starts the process.

Run the API first, then edit `public/js/config.js` with the API and public-site URLs. Run `npm install` and `npm start`; the default admin site is `http://localhost:5501`. The brief does not require authentication, so add authentication and authorization before any real public deployment.
