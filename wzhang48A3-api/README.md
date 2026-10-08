# API package

For cPanel Passenger, set the startup file to `passenger.cjs`. Passenger loads startup files with CommonJS `require()`, while this project uses ES modules; `passenger.cjs` dynamically imports `server.js` after Passenger starts the process. Local development still uses `npm start` and `server.js`.

Requires Node.js 18+ and MySQL 8+. For local MySQL, run `sql/charityevents_db.sql`. In cPanel, create the prefixed database and user with MySQL Database Wizard, select that database in phpMyAdmin, then import `sql/charityevents_cpanel.sql`. Copy `.env.example` to `.env` locally, or enter the same values in the cPanel Node.js application environment settings. The default API address is `http://localhost:3000`. Do not commit `.env` or database passwords.
