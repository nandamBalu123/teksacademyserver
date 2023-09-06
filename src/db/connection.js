const mysql = require('mysql');
const config = require('./config');

const connection = mysql.createConnection(config);


connection.connect((err) => {
    if(err){
        console.log('Error connection to database: ', err);
        return;
    }
    console.log('Connected to the databse');
});

module.exports = connection;