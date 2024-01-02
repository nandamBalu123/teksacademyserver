require('dotenv').config();

module.exports = {
    // host: 'localhost',
    // user: 'demoteks_teks',
    // password: 'Tek$academy@1',
    // database: 'demoteks_teks',
    // host: 'localhost',
    // user: 'root',
    // password: '',
    // database: 'test',
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
};