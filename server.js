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
require("dotenv").config();


// db connection
const dbConnection = require('./src/db/connection');

// websiteformdata file import
const { websiteFormDataApp } = require('./src/websiteformdata/websiteformdata');
app.use('/', websiteFormDataApp);

// admin dashboard inventory System
const { inventorySystem } = require('./src/admindashboard/inventory/inventory');
app.use('/', inventorySystem);

// admin logins and register Signup.js
const { loginandregister } = require('./src/admindashboard/LoginAndRegister/LoginAndRegister');
app.use('/', loginandregister);

const { usersCreation } = require('./src/admindashboard/users/createusers')
app.use('/', usersCreation)

// ssl certificates
// const { sslcert } = require('./src/sslcertificates/sllcertificatecode');

// payments
const paymentRoute = require('./controllers/paymentRoute')

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



// payment razorpay start

// const Razorpay = require('razorpay');
// // app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

// const razorpayInstance = new Razorpay({
//     key_id: RAZORPAY_ID_KEY,
//     key_secret: RAZORPAY_SECRET_KEY
// });

// const renderProductPage = async (req, res) => {
//   try {
//       res.send('Hello, this is the product page!');
//   } catch (error) {
//       console.log(error.message);
//       res.status(500).send('Internal Server Error');
//   }
// }

// app.get('/', renderProductPage);

// app.post('/createOrder', (req, res) => {
//   try {
//       const amount = req.body.amount * 100;
//       const options = {
//           amount: amount,
//           currency: 'INR',
//           receipt: 'balunandam1122@gmail.com'
//       }

//       razorpayInstance.orders.create(options, (err, order) => {
//           if (!err) {
//               res.status(200).json({
//                   success: true,
//                   msg: 'Order Created',
//                   order_id: order.id,
//                   amount: amount,
//                   key_id: RAZORPAY_ID_KEY,
//                   product_name: req.body.name,
//                   description: req.body.description,
//                   contact: "9493991327",
//                   name: "balu",
//                   email: "balunandam1122@gmail.com"
//               });
//           } else {
//               res.status(400).json({ success: false, msg: 'Something went wrong!' });
//           }
//       });

//   } catch (error) {
//       console.log(error.message);
//       res.status(500).json({ success: false, msg: 'Internal Server Error' });
//   }
// });

// payment razorpay end


const Razorpay = require('razorpay');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY
});


// const renderProductPage = async (req, res) => {
//     try {
//         res.send('Hello, this is the product page!');
//     } catch (error) {
//         console.log(error.message);
//         res.status(500).send('Internal Server Error');
//     }
// }

// app.get('/', renderProductPage);

app.post('/createOrder', (req, res) => {
    try {
        const amount = req.body.amount * 100;
        const options = {
            amount: amount,
            currency: 'INR',
            receipt: 'balunandam1122@gmail.com'
        }

        razorpayInstance.orders.create(options, (err, order) => {
            if (!err) {
                // Use the order object to create a payment link
                const paymentLinkOptions = {
                    amount: amount,
                    currency: 'INR',
                    accept_partial: true, // Include any other relevant payment link options
                    reference_id: order.id, // Use the order ID as the reference ID
                    description: req.body.description,
                    customer: {
                        // name: req.body.name,
                        // contact: req.body.contact,
                        // email: req.body.email
                        name: "balu",
                        contact: "9493991327",
                        email: "nbkrishna32@gmail.com",
                    },
                    notify: {
                        sms: true,
                        email: true
                    }
                };

                razorpayInstance.paymentLink.create(paymentLinkOptions, (err, paymentLink) => {
                    if (!err) {
                        // Redirect the user to the payment link
                        res.redirect(paymentLink.short_url);
                    } else {
                        res.status(400).json({ success: false, msg: 'Something went wrong while creating the payment link!' });
                    }
                });
            } else {
                res.status(400).json({ success: false, msg: 'Something went wrong while creating the order!' });
            }
        });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, msg: 'Internal Server Error' });
    }
});





// whatsapp interakt
// const sendWelcomeMessage = async () => {
//   const apiUrl = 'https://api.interakt.ai/v1/public/message/';
//   const apiKey = 'Qkw5bElEanZwZVN3Q2VVUXVxdkp2eVNJN2FOdG9nQ0pQRU1xVkpCOVhXTTo=';
//   const templateName = 'dm_webinar_registration';
//   const countryCode = '+91'; // Replace with the country code of the student
//   const phoneNumber = '9493991327'; // Replace with the phone number of the student

//   const requestBody = {
//     countryCode,
//     phoneNumber,
//     type: 'Template',
//     callbackData: 'some_callback_data', // Optional callback data

//     template: {
//       name: templateName,
//       languageCode: 'en', // Replace with the language code of your template
//       headerValues: [
//         'https://interaktstorage.blob.core.windows.net/mediastoragecontainer/91e5634a-33b0-44b4-a075-884778f02feb/message_template_sample/tcITOHfOz6vy.png?se=2026-08-13T11%3A53%3A58Z&sp=rt&sv=2019-12-12&sr=b&sig=PDn3cPLmV%2BYu3D7Wd10JYmPLQeyGyytl013wAtmbL6g%3D'
//       ],
//       bodyValues: [
//         'There', // Replace with the value for variable {{1}} in body text
//         '1234'   // Replace with the value for variable {{2}} in body text
//       ],
//       buttonValues: {
//         '1': [
//           '12344'  // Replace with the value for {{1}} for dynamic URL in button at index position 0
//         ]
//       }
//     },
//   };

//   const headers = {
//     Authorization: `Basic ${apiKey}`,
//     'Content-Type': 'application/json',
//   };

//   console.log('API Key:', apiKey);
//   console.log('Authorization Header:', headers.Authorization);
//   console.log('Request Body:', JSON.stringify(requestBody, null, 2));

//   try {
//     const response = await axios.post(apiUrl, requestBody, { headers });

//     if (response.data.result) {
//       console.log('Message created successfully!');
//       console.log('Message ID:', response.data.id);
//     } else {
//       console.error('Error creating message:', response.data.message);
//     }
//   } catch (error) {
//     console.error('Error:', error.message);
//     console.error('Error Response:', error.response.data);
//   }
// };

// // Call the function to send the welcome message
// sendWelcomeMessage();



// 2nd
// const sendWelcomeMessage = async () => {
//   const apiUrl = 'https://api.interakt.ai/v1/public/message/';
//   const apiKey = 'Qkw5bElEanZwZVN3Q2VVUXVxdkp2eVNJN2FOdG9nQ0pQRU1xVkpCOVhXTTo=';
//   const templateName = 'welcome_message_to_student';
//   const countryCode = '+91'; // Replace with the country code of the student
//   const phoneNumber = '9493991327'; // Replace with the phone number of the student

//   const requestBody = {
//     countryCode,
//     phoneNumber,
//     type: 'Template',
//     callbackData: 'some_callback_data', // Optional callback data

//     template: {
//       name: templateName,
//       languageCode: 'en', // Replace with the language code of your template
//       headerValues: [
//         'https://interaktstorage.blob.core.windows.net/mediastoragecontainer/91e5634a-33b0-44b4-a075-884778f02feb/message_template_sample/tcITOHfOz6vy.png?se=2026-08-13T11%3A53%3A58Z&sp=rt&sv=2019-12-12&sr=b&sig=PDn3cPLmV%2BYu3D7Wd10JYmPLQeyGyytl013wAtmbL6g%3D'
//       ],
//       bodyValues: [
//         'There' // Replace with the value for variable {{1}} in body text
//         // '1234'   // Replace with the value for variable {{2}} in body text
//       ],
//       buttonValues: {
//         '1': [
//           // '12344'  // Replace with the value for {{1}} for dynamic URL in button at index position 0
//         ]
//       }
//     },
//   };

//   const headers = {
//     Authorization: `Basic ${apiKey}`,
//     'Content-Type': 'application/json',
//   };

//   console.log('API Key:', apiKey);
//   console.log('Authorization Header:', headers.Authorization);
//   console.log('Request Body:', JSON.stringify(requestBody, null, 2));

//   try {
//     const response = await axios.post(apiUrl, requestBody, { headers });

//     if (response.data.result) {
//       console.log('Message created successfully!');
//       console.log('Message ID:', response.data.id);
//     } else {
//       console.error('Error creating message:', response.data.message);
//     }
//   } catch (error) {
//     console.error('Error:', error.message);
//     console.error('Error Response:', error.response.data);
//   }
// };

// // Call the function to send the welcome message
// sendWelcomeMessage();



// payment phonepy

// // Replace these values with your actual credentials and payment details
// const merchantId = 'M18B38OXJS8U';
// const orderId = 'your_order_id';
// const amount = 1; // Replace with the actual amount in paisa
// const returnUrl = 'https://teksacademy.com'; // Replace with your return URL

// const paymentData = {
//   merchantId,
//   orderId,
//   amount,
//   returnUrl,
//   // Add other payment-related details as needed
// };

// const options = {
//   method: 'post',
//   url: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay',
//   headers: {
//     accept: 'text/plain',
//     'Content-Type': 'application/json',
//   },
//   data: paymentData,
// };

// axios
//   .request(options)
//   .then(function (response) {
//     console.log(response.data);
//     // Redirect the user to the PhonePe payment page using the response data
//     // Example: res.redirect(response.data.paymentUrl);
//   })
//   .catch(function (error) {
//     console.error(error);
//     // Handle errors appropriately
//   });



// const merchantId = 'M18B38OXJS8U';
// const merchantTransactionId = 'TXSCAN2311111252386710790446';
// const amount = 100;
// const redirectUrl = 'https://teksacademy.com';
// const redirectMode = 'REDIRECT';
// const callbackUrl = 'https://teksacademy.com';

// const userTimestamp = Date.now().toString();
// const merchantUserId = `user_${userTimestamp}`;

// const paymentData = {
//   merchantId,
//   merchantTransactionId,
//   amount,
//   merchantUserId,
//   redirectUrl,
//   redirectMode,
//   callbackUrl,
//   paymentInstrument: {
//     type: 'PAY_PAGE',
//   },
// };

// const options = {
//   method: 'post',
//   url: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay',
//   headers: {
//     'Accept': 'application/json', // Check PhonePe documentation for the correct value
//     'Content-Type': 'application/json',
//   },
//   data: paymentData,
// };

// axios
//   .request(options)
//   .then(function (response) {
//     console.log(response.data);
//   })
//   .catch(function (error) {
//     console.error('Error details:', error.message);
//     console.error('Error response:', error.response.data);
//     console.error('Error status code:', error.response.status);
//   });



// const crypto = require('crypto');

// const merchantId = 'M18B38OXJS8U';
// const merchantTransactionId = 'TXSCAN2311111252386710790446';
// const amount = 100;
// const redirectUrl = 'https://teksacademy.com';
// const redirectMode = 'REDIRECT';
// const callbackUrl = 'https://teksacademy.com';

// const userTimestamp = Date.now().toString();
// const merchantUserId = `user_${userTimestamp}`;

// const paymentData = {
//   merchantId,
//   merchantTransactionId,
//   amount,
//   merchantUserId,
//   redirectUrl,
//   redirectMode,
//   callbackUrl,
//   paymentInstrument: {
//     type: 'PAY_PAGE',
//   },
// };

// // Create the payload as a JSON string
// const payload = JSON.stringify(paymentData);

// // Replace 'your_salt_key' and 'your_salt_index' with your actual salt key and index
// const saltKey = '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
// const saltIndex = 1;

// // Create the hash for X-VERIFY header
// const hash = crypto.createHash('sha256');
// hash.update(Buffer.from(payload, 'utf-8'));
// hash.update("/pg/v1/pay");
// hash.update(saltKey);
// const xVerifyValue = hash.digest('base64') + "###" + saltIndex;

// const options = {
//   method: 'post',
//   url: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay',
//   headers: {
//     'Content-Type': 'application/json',
//     'X-VERIFY': xVerifyValue,
//   },
//   data: payload,
// };

// axios
//   .request(options)
//   .then(function (response) {
//     console.log(response.data);
//   })
//   .catch(function (error) {
//     console.error('Error details:', error.message);
//     console.error('Error response:', error.response.data);
//     console.error('Error status code:', error.response.status);
//   });

// const { createHash } = require('crypto');


// const merchantId = 'PGTESTPAYUAT';
// const merchantTransactionId = 'TXSCAN2311111252386710790446';
// const amount = 100;
// const redirectUrl = 'https://teksacademy.com';
// const redirectMode = 'REDIRECT';
// const callbackUrl = 'https://teksacademy.com';

// const userTimestamp = Date.now().toString();
// const merchantUserId = `user_${userTimestamp}`;

// const paymentData = {
//   merchantId,
//   merchantTransactionId,
//   amount,
//   merchantUserId,
//   redirectUrl,
//   redirectMode,
//   callbackUrl,
//   paymentInstrument: {
//     type: 'PAY_PAGE',
//   },
// };


// const payload = JSON.stringify(paymentData);


// const saltKey = '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
// const saltIndex = 1;


// const hash = createHash('sha256');
// hash.update(Buffer.from(payload, 'utf-8'));
// hash.update("/pg/v1/pay");
// hash.update(saltKey);
// const xVerifyValue = hash.digest('base64') + "||" + saltIndex;

// const options = {
//   method: 'post',
//   url: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay',
//   headers: {
//     'Content-Type': 'application/json',
//     'X-VERIFY': xVerifyValue,
//   },
//   data: payload,
// };

// axios
//   .request(options)
//   .then(function (response) {
//     console.log(response.data);
//   })
//   .catch(function (error) {
//     console.error('Error details:', error.message);
//     console.error('Error response:', error.response.data);
//     console.error('Error status code:', error.response.status);
//   });