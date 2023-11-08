const http = require('http');
const https = require('https');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');
const nodemailer = require('nodemailer');
const httpProxy = require('http-proxy');
const mailgun = require('mailgun-js');
const tls = require('tls');
const connection = require('./src/db/connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
app.use(cors()); 
app.use(express.json());
app.use(bodyParser.json());

// db connection
const dbConnection = require('./src/db/connection');

// websiteformdata file import
const {websiteFormDataApp} = require('./src/websiteformdata/websiteformdata');
app.use('/', websiteFormDataApp);

// admin dashboard inventory System
const {inventorySystem} = require('./src/admindashboard/inventory/inventory');
app.use('/', inventorySystem);

// admin logins and register Signup.js
const {loginandregister} = require('./src/admindashboard/LoginAndRegister/LoginAndRegister');
app.use('/', loginandregister);

const {usersCreation} = require('./src/admindashboard/users/createusers')
app.use('/', usersCreation)

// ssl certificates
// const { sslcert } = require('./src/sslcertificates/sllcertificatecode');


// Enable CORS
app.use((req, res, next) => {
  // Allow requests from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Allow specific HTTP methods
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  
  // Allow specific headers
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Allow sending cookies across different origins
  res.setHeader('Access-Control-Allow-Credentials', true);
  
  // Continue to the next middleware or route handler
  next();
});




// --------------------------------------------------------

// adding ssl certificates for port number 3000



const privateKeyPath = './src/sslcertificates/private.key';
const certificatePath = './src/sslcertificates/certificate.crt';

const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
const certificate = fs.readFileSync(certificatePath, 'utf8');

const httpsServer = https.createServer(
  { key: privateKey, cert: certificate },
  app
);  

// Start the HTTPS server on port 3000
// const httpsPort = 3000;
// httpsServer.listen(httpsPort, () => {
//   console.log(`HTTPS server running on port ${httpsPort}`);
// });

app.listen(3030, () => {
  console.log('server is running on 3030')
})