# Client package

For cPanel Passenger, set the startup file to `passenger.cjs`. It dynamically imports the ES module `server.js` after Passenger starts the process.

Run the API first, then edit `public/js/config.js` with the API and admin URLs. Run `npm install` and `npm start`; the default public site is `http://localhost:5500`. All event and registration content is loaded through the API.
