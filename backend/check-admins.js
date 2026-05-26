const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./arms-dev.sqlite');

db.all("SELECT id, email, role, firstName, lastName FROM users WHERE role = 'admin'", (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Admin users in database:');
    console.log(JSON.stringify(rows, null, 2));
  }
  db.close();
});
