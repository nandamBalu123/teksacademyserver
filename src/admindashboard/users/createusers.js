const express = require("express");
const app = express();
const http = require("http");
const https = require("https");
const connection = require("../../db/connection");
const axios = require("axios");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const twilio = require("twilio");
const bodyParser = require("body-parser");
const { body, validationResult } = require('express-validator');
// app.use(bodyParser.json());
// Increase the payload size limit for JSON and URL-encoded bodies
app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '200mb' }));
// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    res.status(400).json({ error: 'Invalid JSON' });
  } else {
    next();
  }
});
const session = require('express-session');

const multer = require("multer");
const multerS3 = require('multer-s3');
const cors = require('cors');
app.use(cors()); 
app.use(cookieParser());
const fileUpload = require('express-fileupload');
// Set a higher file size limit (20 MB in this example)
app.use(fileUpload({
  limits: { fileSize: 20 * 1024 * 1024 },
}));

app.use(express.json({ limit: '20mb' }));

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
// Set up the session middleware
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));

// const fileUpload = require("express-fileupload");
const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: "AKIARCHFX7O6LLRZW5EE",
  secretAccessKey: "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",
  region: "us-east-1",
});



app.use(fileUpload());
const { v4: uuidv4 } = require("uuid");

const s3 = new AWS.S3();


// Create a multer storage engine for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB in bytes
  },
});

// welcome msg to student

const sendWelcomeMessage = async (studentName, MobileNumber) => {
  const apiUrl = 'https://api.interakt.ai/v1/public/message/';
  const apiKey = 'Qkw5bElEanZwZVN3Q2VVUXVxdkp2eVNJN2FOdG9nQ0pQRU1xVkpCOVhXTTo=';
  const templateName = 'welcome_message_to_student';
  const countryCode = '+91'; // Replace with the country code of the student
  const phoneNumber = `${MobileNumber}`; // Replace with the phone number of the student

  const requestBody = {
    countryCode,
    phoneNumber,
    type: 'Template',
    callbackData: 'some_callback_data', // Optional callback data

    template: {
      name: templateName,
      languageCode: 'en', // Replace with the language code of your template
      headerValues: [
        'https://interaktstorage.blob.core.windows.net/mediastoragecontainer/91e5634a-33b0-44b4-a075-884778f02feb/message_template_sample/tcITOHfOz6vy.png?se=2026-08-13T11%3A53%3A58Z&sp=rt&sv=2019-12-12&sr=b&sig=PDn3cPLmV%2BYu3D7Wd10JYmPLQeyGyytl013wAtmbL6g%3D'
      ],
      bodyValues: [
        `${studentName}` // Replace with the value for variable {{1}} in body text
        // '1234'   // Replace with the value for variable {{2}} in body text
      ],
      buttonValues: {
        '1': [
          // '12344'  // Replace with the value for {{1}} for dynamic URL in button at index position 0
        ]
      }
    },
  };

  const headers = {
    Authorization: `Basic ${apiKey}`,
    'Content-Type': 'application/json',
  };

  console.log('API Key:', apiKey);
  console.log('Authorization Header:', headers.Authorization);
  console.log('Request Body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await axios.post(apiUrl, requestBody, { headers });

    if (response.data.result) {
      console.log('Message created successfully!');
      console.log('Message ID:', response.data.id);
    } else {
      console.error('Error creating message:', response.data.message);
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Error Response:', error.response.data);
  }
};



// student form

app.post("/student_form", (req, res) => {
  const { filename, data } = req.body;
  const sql = `
    INSERT INTO student_details (
      name, email, mobilenumber, parentsname, parentsnumber, birthdate, gender, maritalstatus,
      college, country, state, area, native, zipcode, whatsappno, educationtype, marks,
      academicyear, studentImg, imgData, enquirydate, enquirytakenby, coursepackage, courses, 
      leadsource, branch, modeoftraining, registrationnumber, 
      admissiondate, validitystartdate, validityenddate, feedetails, grosstotal,
      totaldiscount, totaltax, grandtotal, finaltotal, admissionremarks, assets, totalinstallments,
      dueamount, addfee, initialpayment, duedatetype, installments, materialfee,
      feedetailsbilling, totalfeewithouttax, totalpaidamount, certificate_status, extra_discount, user_id
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // Convert the feedetails array to JSON
  const leadsource = req.body.leadsource;
  const leadsourceJSON = JSON.stringify(leadsource);
  const feedetails = req.body.feedetails;
  const installments = req.body.installments;
  const extra_discount = req.body.extra_discount;
  const certificate_status = req.body.certificate_status;
  const certificate_statusJSON = JSON.stringify(certificate_status);
  const feedetailsbilling = req.body.feedetailsbilling;
  const initialpayment = req.body.initialpayment;
  const initialpaymentJSON = JSON.stringify(initialpayment);
  const feedetailsJSON = JSON.stringify(feedetails);
  const installmentsJSON = JSON.stringify(installments);
  const feedetailsbillingJSON = JSON.stringify(feedetailsbilling);
  const assets = req.body.assets;
  const extra_discountJSON = JSON.stringify(extra_discount);
  const assetsJSON = JSON.stringify(assets);


  const values = [
    req.body.name,
    req.body.email,
    req.body.mobilenumber,
    req.body.parentsname,
    req.body.parentsnumber,
    req.body.birthdate,
    req.body.gender,
    req.body.maritalstatus,
    req.body.college,
    req.body.country,
    req.body.state,
    req.body.area,
    req.body.native,
    req.body.zipcode,
    req.body.whatsappno,
    req.body.educationtype,
    req.body.marks,
    req.body.academicyear,
    filename,
    data,
    req.body.enquirydate,
    req.body.enquirytakenby,
    req.body.coursepackage,
    req.body.courses,
    // req.body.leadsource,
    leadsourceJSON,
    req.body.branch,
    req.body.modeoftraining,
    req.body.registrationnumber,
    req.body.admissiondate,
    req.body.validitystartdate,
    req.body.validityenddate,
    feedetailsJSON,
    req.body.grosstotal,
    req.body.totaldiscount,
    req.body.totaltax,
    req.body.grandtotal,
    req.body.finaltotal,
    req.body.admissionremarks,
    assetsJSON,
    req.body.totalinstallments,
    req.body.dueamount,
    req.body.addfee,
    initialpaymentJSON,
    req.body.duedatetype,
    installmentsJSON,
    req.body.materialfee,
    feedetailsbillingJSON,
    req.body.totalfeewithouttax,
    req.body.totalpaidamount,
    certificate_statusJSON,
    extra_discountJSON,
    req.body.user_id,
  ];
  // Execute the SQL query
  connection.query(sql, values, (insertErr, insertResult) => {
    if (insertErr) {
      console.error("Error in INSERT query:", insertErr);
      return res.status(500).json("Internal Server Error");
    }else {
      // Upload the photo to S3
      const params = {
        Bucket: 'teksacademyimages',
        Key: filename,
        Body: Buffer.from(data, 'base64'),
        ACL: 'public-read', // Adjust the ACL as needed
      };

      s3.upload(params, async (err, data) => {
        if (err) {
          console.error('Error uploading to S3:', err);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          await sendWelcomeMessage(req.body.name, req.body.mobilenumber);
          res.json({ message: 'Photo uploaded successfully' });
        }
      });
    }
    return res.status(201).json(insertResult);
  });
});



app.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: "Success" });
});


app.post("/createuser", (req, res) => {
  const email = req.body.email;
  const passwordd = email.split("@")[0];
  // const passworddwithnum = passwordd;
  // console.log(passworddwithnum);
 
  // Check if the email already exists in the database
  const checkEmailQuery = "SELECT COUNT(*) AS count FROM user WHERE email = ?";
  connection.query(checkEmailQuery, [email], (err, emailResult) => {
    if (err) {
      console.error("Error checking email in the database:", err);
      return res.json({ Status: "Error" });
    }
 
    // Check if the email count is greater than 0, indicating that the email already exists
    if (emailResult[0].count > 0) {
      console.log("Email already exists.");
      // return res.json({ Status: "Email already exists" });
      return res.json({ Status: "exists" });
    }
 
    // If the email is not found, proceed with user creation
    bcrypt.hash(passwordd, 10, (hashErr, hash) => {
      if (hashErr) {
        console.error("Error in hashing password:", hashErr);
        return res.json({ Error: "Error in hashing password" });
      }
 
      const insertUserQuery =
        "INSERT INTO user (`fullname`, `email`, `password`, `phonenumber`, `designation`, `department`, `reportto`, `profile`, `branch`,`user_remarks_history`) VALUES (?)";
 
      const user_remarks_history = req.body.user_remarks_history;
      const user_remarks_historyJSON = JSON.stringify(user_remarks_history);
      const values = [
        req.body.fullname,
        email,
        hash,
        req.body.phonenumber,
        req.body.designation,
        req.body.department,
        req.body.reportto,
        req.body.profile,
        req.body.branch,
        user_remarks_historyJSON,
      ];
 
      connection.query(insertUserQuery, [values], (insertErr, result) => {
        if (insertErr) {
          console.error("Error in database query:", insertErr);
          return res.json({ Status: "Error" });
        }
        console.log("User created successfully.");
        return res.json({ reqBody: req.body, Result: result });
      });
    });
  });
});


//  backup 11/7/2023
// app.post("/createuser", (req, res) => {
//   const email = req.body.email;
//   const passwordd = email.split("@")[0];
//   // const passworddwithnum = passwordd;
//   // console.log(passworddwithnum);
 
//   // Check if the email already exists in the database
//   const checkEmailQuery = "SELECT COUNT(*) AS count FROM user WHERE email = ?";
//   connection.query(checkEmailQuery, [email], (err, emailResult) => {
//     if (err) {
//       console.error("Error checking email in the database:", err);
//       return res.json({ Status: "Error" });
//     }
 
//     // Check if the email count is greater than 0, indicating that the email already exists
//     if (emailResult[0].count > 0) {
//       console.log("Email already exists.");
//       // return res.json({ Status: "Email already exists" });
//       return res.json({ Status: "exists" });
//     }
 
//     // If the email is not found, proceed with user creation
//     bcrypt.hash(passwordd, 10, (hashErr, hash) => {
//       if (hashErr) {
//         console.error("Error in hashing password:", hashErr);
//         return res.json({ Error: "Error in hashing password" });
//       }
 
//       const insertUserQuery =
//         "INSERT INTO user (`fullname`, `email`, `password`, `phonenumber`, `designation`, `department`, `reportto`, `profile`, `branch`,`user_status`) VALUES (?)";
 
//       const user_status = req.body.user_status;
//       const user_statusJSON = JSON.stringify(user_status);
//       const values = [
//         req.body.fullname,
//         email,
//         hash,
//         req.body.phonenumber,
//         req.body.designation,
//         req.body.department,
//         req.body.reportto,
//         req.body.profile,
//         req.body.branch,
//         user_statusJSON,
//       ];
 
//       connection.query(insertUserQuery, [values], (insertErr, result) => {
//         if (insertErr) {
//           console.error("Error in database query:", insertErr);
//           return res.json({ Status: "Error" });
//         }
//         console.log("User created successfully.");
//         return res.json(req.body);
//       });
//     });
//   });
// });


app.get("/userdata", (req, res) => {
  const sql = "SELECT * FROM user ORDER BY id DESC";
 
  connection.query(sql, (err, result) => {
    if (err) {
      res.status(422).json("No data available");
    } else {
      // Parse the "installments" JSON strings into JavaScript objects
      const parsedResults = result.map((row) => {
        const userRemarksHistory = JSON.parse(row.user_remarks_history);
 
        return {
          ...row,
          user_remarks_history: userRemarksHistory,
        };
      });
 
      res.status(201).json(parsedResults);
    }
  });
});

// backup 11/7/2023
// app.get("/userdata", (req, res) => {
//   const sql = "SELECT * FROM user ORDER BY id DESC";
//   connection.query(sql, (err, result) => {
//     if (err) {
//       res.status(422).json("nodata available");
//     } else {
//       res.status(201).json(result);
//     }
//   });
// });




// Secret key for JWT (store this securely and use environment variables)
// const jwtSecretKey = "your_secret_key";
// app.post("/adminlogin", (req, res) => {
//   const { email, password } = req.body;
//   const sql = "SELECT * FROM user WHERE email = ?";

//   // console.log('Email from Request:', email);
//   // console.log('Password from Request:', password);

//   // Ensure both variables are valid strings
//   const trimmedEmail = String(email).trim();
//   const trimmedPassword = String(password).trim();

//   connection.query(sql, [trimmedEmail], (err, result) => {
//     if (err) {
//       console.error("Error running database query:", err);
//       return res
//         .status(500)
//         .json({ Status: "Error", Error: "Error in running query" });
//     }

//     if (result.length === 0) {
//       console.log("User not found");
//       return res.status(401).json({ Status: "Error", Error: "User not found" });
//     }

//     const hashedPasswordFromDatabase = result[0].password;

//     // Compare the user-provided password with the hashed password from the database
//     bcrypt.compare(
//       trimmedPassword,
//       hashedPasswordFromDatabase,
//       (bcryptErr, bcryptResult) => {
//         console.log("bcryptErr:", bcryptErr);
//         console.log("bcryptResult:", bcryptResult);

//         if (bcryptErr || !bcryptResult) {
//           console.log("Wrong Email or Password");
//           return res
//             .status(401)
//             .json({ Status: "Error", Error: "Wrong Email or Password" });
//         }

//         const token = jwt.sign({ profile: "admin" }, jwtSecretKey, {
//           expiresIn: "1d",
//         });
//         res.cookie("token", token);
//         console.log("User logged in successfully. Token generated:", token);

//         // Fetch admin-specific data from the database here
//         // You can execute another query to retrieve data specific to admin users
//         // For example:
//         const adminDataSql = "SELECT * FROM user WHERE id = ?";
//         const adminId = result[0].id;

//         connection.query(adminDataSql, [adminId], (adminErr, adminResult) => {
//           if (adminErr) {
//             console.error("Error fetching admin data:", adminErr);
//             return res
//               .status(500)
//               .json({ Status: "Error", Error: "Error fetching admin data" });
//           }
//           // Assuming admin data is successfully fetched, you can include it in the response
//           const adminData = adminResult[0];

//           // res.cookie('token', token, { httpOnly: false });
//           res.cookie("token", token);
//           return res
//             .status(200)
//             .json({ Status: "Success", adminData: adminData, token: token });

//           // res.cookie('token', token);
//           // return res.status(200).json({ Status: "Success", AdminData: adminData });
//         });
//       }
//     );
//   });
// });


// const jwtSecretKey = "your_secret_key";

// app.post("/adminlogin", (req, res) => {
//   const { email, password } = req.body;
//   const sql = "SELECT * FROM user WHERE email = ?";

//   // console.log('Email from Request:', email);
//   // console.log('Password from Request:', password);

//   // Ensure both variables are valid strings
//   const trimmedEmail = String(email).trim();
//   const trimmedPassword = String(password).trim();

//   connection.query(sql, [trimmedEmail], (err, result) => {
//     if (err) {
//       console.error("Error running database query:", err);
//       return res
//         .status(500)
//         .json({ Status: "Error", Error: "Error in running query" });
//     }

//     if (result.length === 0) {
//       console.log("User not found");
//       return res.status(401).json({ Status: "Error", Error: "User not found" });
//     }

//     const hashedPasswordFromDatabase = result[0].password;

//     // Compare the user-provided password with the hashed password from the database
//     bcrypt.compare(
//       trimmedPassword,
//       hashedPasswordFromDatabase,
//       (bcryptErr, bcryptResult) => {
//         console.log("bcryptErr:", bcryptErr);
//         console.log("bcryptResult:", bcryptResult);

//         if (bcryptErr || !bcryptResult) {
//           console.log("Wrong Email or Password");
//           return res
//             .status(401)
//             .json({ Status: "Error", Error: "Wrong Email or Password" });
//         }

//         var userPayload = {
//           userId: result[0].id,
//           username: result[0].fullname,
//           role: result[0].profile, // Assuming you have a "role" field in your user table
//         };

//         req.session.userPayload = userPayload;


//         const token = jwt.sign(userPayload, jwtSecretKey, {
//           expiresIn: "1d",
//         });
//         res.cookie("token", token);
//         console.log("User logged in successfully. Token generated:", token);
//         console.log("userId: ", userPayload);
        
        
//         // Fetch admin-specific data from the database here
//         // You can execute another query to retrieve data specific to admin users
//         // For example:
//         const adminDataSql = "SELECT * FROM user WHERE id = ?";
//         const adminId = result[0].id;

//         connection.query(adminDataSql, [adminId], (adminErr, adminResult) => {
//           if (adminErr) {
//             console.error("Error fetching admin data:", adminErr);
//             return res
//               .status(500)
//               .json({ Status: "Error", Error: "Error fetching admin data" });
//           }
//           // Assuming admin data is successfully fetched, you can include it in the response
//           const adminData = adminResult[0];

//           // res.cookie('token', token, { httpOnly: false });
//           res.cookie("token", token);
//           return res
//             .status(200)
//             .json({ Status: "Success", adminData: adminData, token: token });

//           // res.cookie('token', token);
//           // return res.status(200).json({ Status: "Success", AdminData: adminData });
//         });
//       }
//     );
//   });
// });


const jwtSecretKey = "your_secret_key";

app.post("/adminlogin", (req, res) => {
  // console.log(req.body)
  
    
  const { email, password } = req.body; 

  const sql = "SELECT * FROM user WHERE email = ?";

  // Ensure both variables are valid strings
  const trimmedEmail = String(email).trim();
  const trimmedPassword = String(password).trim();

  connection.query(sql, [trimmedEmail], (err, result) => {
    if (err) {
      console.error("Error running database query:", err);
      return res
        .status(500)
        .json({ Status: "Error", Error: "Error in running query" });
    }

    if (result.length === 0) {
      console.log("User not found");
      return res.status(401).json({ Status: "Error", Error: "User not found" });
    }

    const userStatus = result[0].user_status;

    // Check if the user is inactive
    if (userStatus == 0) {
      console.log("User account is inactive");
      return res.status(401).json({
        Status: "inactive",
        Error: "Your account is inactive. Please contact the admin.",
      })
    }

    const hashedPasswordFromDatabase = result[0].password;

    // Compare the user-provided password with the hashed password from the database
    bcrypt.compare(
      trimmedPassword,
      hashedPasswordFromDatabase,
      (bcryptErr, bcryptResult) => {
        console.log("bcryptErr:", bcryptErr);
        console.log("bcryptResult:", bcryptResult);

        if (bcryptErr || !bcryptResult) {
          console.log("Wrong Email or Password");
          return res
            .status(401)
            .json({ Status: "Error", Error: "Wrong Email or Password" });
        }

        var userPayload = {
          userId: result[0].id,
          username: result[0].fullname,
          role: result[0].profile, // Assuming you have a "role" field in your user table
        };

        req.session.userPayload = userPayload;


        const token = jwt.sign(userPayload, jwtSecretKey, {
          expiresIn: "1d",
        });
        res.cookie("token", token);
        console.log("User logged in successfully. Token generated:", token);
        console.log("userId: ", userPayload);
        
        
        
        const adminDataSql = "SELECT * FROM user WHERE id = ?";
        const adminId = result[0].id;

        connection.query(adminDataSql, [adminId], (adminErr, adminResult) => {
          if (adminErr) {
            console.error("Error fetching admin data:", adminErr);
            return res
              .status(500)
              .json({ Status: "Error", Error: "Error fetching admin data" });
          }
          // Assuming admin data is successfully fetched, you can include it in the response
          const adminData = adminResult[0];

          // res.cookie('token', token, { httpOnly: false });
          res.cookie("token", token);
          return res
            .status(200)
            .json({ Status: "Success", adminData: adminData, token: token });

          // res.cookie('token', token);
          // return res.status(200).json({ Status: "Success", AdminData: adminData });
        });
      }
    );
  });
});





// function authenticateUser(req, res, next) {
//   const token = req.cookies.token;
//   console.log("token cookie", token)

//   if (!token) {
//     return res.status(401).json({ Status: "Error", Error: "Unauthorized" });
//   }

//   jwt.verify(token, jwtSecretKey, (err, user) => {
//     if (err) {
//       return res.status(401).json({ Status: "Error", Error: "Invalid token" });
//     }

//     req.user = user;
//     console.log("req.user: ", req.user)
//     next();

//     console.log("req.user", req.user)
//   });
// }



// // testing
// app.get("/getstudent_data", authenticateUser, (req, res) => {
//   console.log('User profile from req.user:', req.user.profile);
//   console.log('User ID from req.user:', req.user.user_id);
  
//   console.log("reeqquserPayload: ", userPayload);
//   // Check if the user has an "admin" role
//   if (req.user.profile === 'admin') {
//     // If the user is an admin, fetch all student data
//     const sql = "SELECT * FROM student_details";
//     connection.query(sql, (err, result) => {
//       if (err) {
//         res.status(422).json("No data available");
//       } else {
//         // Parse the "installments" JSON strings into JavaScript objects
//         const parsedResults = result.map((row) => {
//           const parsedTotalInstallments = JSON.parse(row.totalinstallments);
//           const parsedInstallments = JSON.parse(row.installments);
//           const parsedInitialpayment = JSON.parse(row.initialpayment);
//           const parsedCertificateStatus = JSON.parse(row.certificate_status);
//           return {
//             ...row,
//             totalinstallments: parsedTotalInstallments,
//             installments: parsedInstallments,
//             initialpayment: parsedInitialpayment,
//             certificate_status: parsedCertificateStatus,
//           };
//         });
//         parsedResults.reverse();
//         res.status(201).json(parsedResults);
//       }
//     });
//   } else {
//     // If the user is not an admin, fetch data for the specific user_id
//     const user_id = req.user.user_id; // Assuming you have user information in req.user
//     console.log("user_id: ", user_id)
//     const sql = "SELECT * FROM student_details WHERE user_id = ?";
//     connection.query(sql, [user_id], (err, result) => {
//       if (err) {
//         res.status(422).json("No data available");
//       } else {
//         // Parse the "installments" JSON strings into JavaScript objects
//         const parsedResults = result.map((row) => {
//           const parsedTotalInstallments = JSON.parse(row.totalinstallments);
//           const parsedInstallments = JSON.parse(row.installments);
//           const parsedInitialpayment = JSON.parse(row.initialpayment);
//           const parsedCertificateStatus = JSON.parse(row.certificate_status);
//           return {
//             ...row,
//             totalinstallments: parsedTotalInstallments,
//             installments: parsedInstallments,
//             initialpayment: parsedInitialpayment,
//             certificate_status: parsedCertificateStatus,
//           };
//         });
//         parsedResults.reverse();
//         res.status(201).json(parsedResults);
//       }
//     });
//   }
  
// });


// app.post('/userlogin', (req, res) => {
//     const sql = "SELECT * FROM user WHERE email = ? AND password = ?";
//     connection.query(sql, [req.body.email, req.body.password], (err, data) => {
//         if(err) return res.json({Message: 'server side error'})
//         if(data.length > 0){
//             const name = data[0].name;
//             const token = jwt.sign({name}, 'jsonwebtoken-secret-key', {expiresIn: '1d'});
//             res.cookie('token', token);
//         }else{
//             return res.json({Message: 'no records found'})
//         }
//     })
// })

const verifyUser = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.json({ Error: "You are no Authenticated" });
  } else {
    jwt.verify(token, "jwt-secret-key", (err, decoded) => {
      if (err) return res.json({ Error: "Token wrong" });
      req.role = decoded.role;
      req.id = decoded.id;
      next();
    });
  }
};

app.get("/dashboard", verifyUser, (req, res) => {
  return res.json({ Status: "Success", role: req.role, id: req.id });
});

app.post("/employeelogin", (req, res) => {
  const sql = "SELECT * FROM user Where email = ?";
  connection.query(sql, [req.body.email], (err, result) => {
    if (err)
      return res.json({ Status: "Error", Error: "Error in runnig query" });
    if (result.length > 0) {
      bcrypt.compare(
        req.body.password.toString(),
        result[0].password,
        (err, response) => {
          if (err) return res.json({ Error: "password error" });
          if (response) {
            const token = jwt.sign(
              { profile: "admin", id: result[0].id },
              "jwt-secret-key",
              { expiresIn: "1d" }
            );
            res.cookie("token", token);
            return res.json({ Status: "Success", id: result[0].id });
          } else {
            return res.json({
              Status: "Error",
              Error: "Wrong Email or Password",
            });
          }
        }
      );
    } else {
      console.log("wrong email");
      return res.json({ Status: "Error", Error: "Wrong Email or Password" });
    }
  });
});

// app.post("/userroles", (req, res) => {
//   const sql = "INSERT INTO roles_permissions (role,description,createdby,permissions) VALUES (?, ?, ?, ?)";
//   const rolesPermissions = req.body.permissions;
//   const rolesPermissionsJOSN = JSON.stringify(rolesPermissions);
//   const values = [req.body.role, req.body.description, "blue", rolesPermissionsJOSN];


//   console.log(rolesPermissionsJOSN, rolesPermissions)
//   // if (!values.every((value) => value !== undefined)) {
//   //   return res.status(422).json("Please fill in all the data");
//   // }

//   //  selectResult
  
//   connection.query(sql, values, (insertErr, insertResult) => {
//     if (insertErr) {
//       console.log("Error in INSERT query: ", insertErr);
//       return res.status(500).json("Internal Server Error");
//     }

//     return res.status(201).json(req.body);
//   });
// });

app.post("/userroles", (req, res) => {
  const sql = "INSERT INTO roles_permissions (role, description, createdby, permissions) VALUES (?, ?, ?, ?)";
  
  // Check if role and description are provided
  if (!req.body.role || !req.body.description) {
    return res.status(422).json("Role and description are required");
  }

  // Check if permissions are provided
  if (!req.body.permissions) {
    return res.status(422).json("Permissions cannot be null or undefined");
  }

  // Stringify permissions
  const rolesPermissionsJOSN = JSON.stringify(req.body.permissions);
  
  const values = [req.body.role, req.body.description, "blue", rolesPermissionsJOSN];

  connection.query(sql, values, (insertErr, insertResult) => {
    if (insertErr) {
      console.error("Error in INSERT query: ", insertErr);
      return res.status(500).json("Internal Server Error");
    }

    // return res.status(201).json(req.body);
    return res.status(200).json(req.body);
  });
});


app.get("/getuserroles", (req, res) => {
  const sql = "SELECT * FROM roles_permissions";

  connection.query(sql, (err, result) => {
    if (err) {
      res.status(422).json("No data available");
    } else {
      const parsedResults = result.map((row) => {
        const parsedPermissions = JSON.parse(row.permissions);
        return {
          ...row,
          permissions: parsedPermissions,
          
        };
      });
      parsedResults.reverse();
      res.status(201).json(parsedResults);
    }
  });
});

app.put("/updaterolespermissions/:id", (req, res) => {
  const sql = "UPDATE roles_permissions SET permissions = ? WHERE id = ?;";
  const id = req.params.id;
  const permissions = req.body.permissions;

  const permissionsJSON = JSON.stringify(permissions);


  connection.query(sql, [permissionsJSON, id], (err, result) => {
    if (err) {
      console.error("Error update status:", err);
      return res.status(500).json({ error: "Internal Server Error" }); // Return an error response
    }
    return res.status(200).json({ updated: true }); // Return a success response
  });
  
})

app.get("/userroles/:id", (req, res) => {
  const { id } = req.params;
 
  connection.query("SELECT * FROM roles_permissions WHERE id = ? ", id, (err, result) => {
    if (err) {
      res.status(422).json("No data available");
    } else {
      // let parsedResults = result;
      // parsedResults[0].user_remarks_history = JSON.parse(
      //   parsedResults[0].user_remarks_history
      // );
      res.status(201).json(parsedResults);
    }
  });
});


// app.get("/viewuser/:id", (req, res) => {
//   const { id } = req.params;
 
//   connection.query("SELECT * FROM user WHERE id = ? ", id, (err, result) => {
//     if (err) {
//       res.status(422).json("No data available");
//     } else {
//       let parsedResults = result;
//       parsedResults[0].user_remarks_history = JSON.parse(
//         parsedResults[0].user_remarks_history
//       );
//       res.status(201).json(parsedResults);
//     }
//   });
// });

app.get("/viewuser/:id", (req, res) => {
  const { id } = req.params;

  connection.query("SELECT * FROM user WHERE id = ? ", id, (err, result) => {
    if (err) {
      res.status(422).json("No data available");
    } else if (result && result.length > 0) {
      let parsedResults = result;
      
      // Check if user_remarks_history is not undefined before parsing
      if (parsedResults[0].user_remarks_history !== undefined) {
        parsedResults[0].user_remarks_history = JSON.parse(
          parsedResults[0].user_remarks_history
        );
      }

      res.status(201).json(parsedResults);
    } else {
      res.status(404).json("User not found");
    }
  });
});


app.put("/updateuser/:id", (req, res) => {
  const sql =
    "UPDATE user SET fullname = ?, email = ?, phonenumber = ?, designation = ?, department = ?, reportto = ?, profile = ?, branch = ? WHERE id = ?;";
  const id = req.params.id;
  const {
    fullname,
    email,
    phonenumber,
    designation,
    department,
    reportto,
    profile,
    branch,
  } = req.body; // Destructure the request body

  connection.query(
    sql,
    [
      fullname,
      email,
      phonenumber,
      designation,
      department,
      reportto,
      profile,
      branch,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating user:", err);
        return res.status(500).json({ error: "Internal Server Error" }); // Return an error response
      }
      return res.status(200).json({ updated: true }); // Return a success response
    }
  );
});

// student management


app.get("/getstudent_data", (req, res) => {
  const sql = "SELECT * FROM student_details";
 
  connection.query(sql, (err, result) => {
    if (err) {
      res.status(422).json("No data available");
    } else {
      
      const parsedResults = result.map((row) => {
        const parsedLeadsource = JSON.parse(row.leadsource);
        const parsedTotalInstallments = JSON.parse(row.totalinstallments);
        const parsedInstallments = JSON.parse(row.installments);
        const parsedInitialpayment = JSON.parse(row.initialpayment);
        const parsedcertificate_status = JSON.parse(row.certificate_status);
        const parsedAssets = JSON.parse(row.assets);
        const ParsedExtra_discount = JSON.parse(row.extra_discount);
        const ParsedFeeDetails = JSON.parse(row.feedetails);
        const ParsedFeeDetailsbilling = JSON.parse(row.feedetailsbilling);
        
        return {
          ...row,
          leadsource: parsedLeadsource,
          totalinstallments: parsedTotalInstallments,
          installments: parsedInstallments,
          initialpayment: parsedInitialpayment,
          certificate_status: parsedcertificate_status,
          assets: parsedAssets,
          extra_discount: ParsedExtra_discount,
          feedetails: ParsedFeeDetails,
          feedetailsbilling: ParsedFeeDetailsbilling,
        };
      });
 
      parsedResults.reverse();
      res.status(201).json(parsedResults);
    }
  });
});



app.get("/viewstudentdata/:id", (req, res) => {
  const { id } = req.params;

  connection.query(
    "SELECT * FROM student_details WHERE id = ? ",
    id,
    (err, result) => {
      if (err) {
        res.status(422).json("error");
      } else {
        // Parse the "installments" JSON strings into JavaScript objects
        const parsedResults = result.map((row) => {
          const parsedTotalInstallments = JSON.parse(row.totalinstallments);
          const parsedInstallments = JSON.parse(row.installments);
          const parsedInitialpayment = JSON.parse(row.initialpayment);
          
          

          return {
            ...row,
            totalinstallments: parsedTotalInstallments,
            installments: parsedInstallments,
            initialpayment: parsedInitialpayment,
            
          };
        });

        res.status(201).json(parsedResults);
      }
    }
  );
});

// app.put("/addfee/:id", (req, res) => {
//   const id = req.params.id;
//   const dueamount = req.body.dueamount;
//   const initialpayment = req.body.initialpayment;
//   const initialpaymentJSON = JSON.stringify(initialpayment);
//   const totalinstallments = req.body.totalinstallments;
//   const addfee = req.body.addfee;
//   const installments = req.body.installments;
//   const totalpaidamount = req.body.totalpaidamount;

//   const sql =
//     "UPDATE student_details SET totalinstallments = ?, dueamount = ?, addfee = ?, initialpayment = ?, installments = ?, totalpaidamount = ? WHERE id = ?;";

//   const totalinstallmentsJSON = JSON.stringify(totalinstallments);
//   const installmentsJSON = JSON.stringify(installments);

//   connection.query(
//     sql,
//     [
//       totalinstallmentsJSON,
//       dueamount,
//       addfee,
//       initialpaymentJSON,
//       installmentsJSON,
//       totalpaidamount,
//       id,
//     ],
//     (err, result) => {
//       if (err) {
//         console.error("Error updating user:", err);
//         return res.status(500).json({ error: "Internal Server Error" }); // Return an error response
//       }
//       return res.status(200).json({ updated: true }); // Return a success response
//     }
//   );
// });

app.put("/noofinstallments/:id", (req, res) => {
  const id = req.params.id;
  const addfee = req.body.addfee;

  const totalinstallments = req.body.totalinstallments;
  const totalinstallmentsJSON = JSON.stringify(totalinstallments);

  const installments = req.body.installments;

  const installmentsJSON = JSON.stringify(installments);
  const sql =
    "UPDATE student_details SET totalinstallments = ?,addfee = ?, installments = ? WHERE id = ?;";

  connection.query(
    sql,
    [totalinstallmentsJSON, addfee, installmentsJSON, id],
    (err, result) => {
      if (err) {
        console.error("Error updating user:", err);
        return res.status(500).json({ error: "Internal Server Error" }); // Return an error response
      }
      return res.status(200).json({ updated: true }); // Return a success response
    }
  );
});




app.post('/studentfeerefund', (req, res) => {
  const { refund } = req.body;
  const refundJSON = JSON.stringify(refund)
  const regNum = refund[0].registrationnumber;
  
  if (!refund) {
    return res.status(400).json({ error: 'Registration number and refund amount are required.' });
  }

  const checkQuery = 'SELECT * FROM student_details WHERE registrationnumber = ?';

  connection.query(checkQuery, [regNum], (err, results) => {
    if (err) {
      console.error('Error checking registration number:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length === 0) {
      const createTableQuery = 'CREATE TABLE IF NOT EXISTS refunds (id INT AUTO_INCREMENT PRIMARY KEY, refund TEXT)';
      
      connection.query(createTableQuery, (createErr) => {
        if (createErr) {
          console.error('Error creating refund table:', createErr);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        const insertQuery = 'INSERT INTO refund (refund) VALUES (?)';
        connection.query(insertQuery, [refundJSON], (insertErr) => {
          if (insertErr) {
            console.error('Error inserting refund record:', insertErr);
            return res.status(500).json({ error: 'Internal Server Error' });
          }

          return res.json({ message: `Refund record inserted for registration number ${regNum}` });
        });
      });
    } else {
      
      const updateQuery = 'UPDATE student_details SET refund = ? WHERE registrationnumber = ?';

      // Create the refund column if it doesn't exist
      const createRefundColumnQuery = `
        ALTER TABLE student_details
        ADD COLUMN IF NOT EXISTS refund TEXT;
      `;
      
      connection.query(createRefundColumnQuery, (createColumnErr) => {
        if (createColumnErr) {
          console.error('Error creating refund column:', createColumnErr);
          return res.status(500).json({ error: 'Internal Server Error ' });
        }
      
        // Now update the refund for the specified registration number
        connection.query(updateQuery, [refundJSON, regNum], (updateErr) => {
          if (updateErr) {
            console.error('Error updating student_details:', updateErr);
            return res.status(500).json({ error: 'Internal Server Error' });
          }
      
          return res.json({ message: `Refund updated for registration number ${regNum}` });
        });
      });
    }
  });
});

app.get("/studentrefundsfromrefunds", (req, res) => {
  const sql = "SELECT * FROM refund";
  connection.query(sql, (err, result) => {
    if(err){
      return res.json({Error: "get refunds error in sql"})
    }
    return res.json(result);
  })
})



app.put("/admissionfee/:id", (req, res) => {
  const id = req.params.id;
  const dueamount = req.body.dueamount;
  const initialpayment = req.body.initialpayment;
  const initialpaymentJSON = JSON.stringify(initialpayment);

  const totalpaidamount = req.body.totalpaidamount;

  const sql =
    "UPDATE student_details SET  dueamount = ?,  initialpayment = ?,  totalpaidamount = ? WHERE id = ?;";

  connection.query(
    sql,
    [dueamount, initialpaymentJSON, totalpaidamount, id],
    (err, result) => {
      if (err) {
        console.error("Error updating user:", err);
        return res.status(500).json({ error: "Internal Server Error" }); // Return an error response
      }
      return res.status(200).json({ updated: true }); // Return a success response
    }
  );
});
app.put("/updateduedateanddueamount/:id", (req, res) => {
  const sql =
    "UPDATE student_details SET installments = ?, nextduedate = ? WHERE id = ?;";
  const id = req.params.id;
 
  const installments = req.body.installments;
  const installmentsJSON = JSON.stringify(installments);
 
  const nextduedate = req.body.nextduedate;
 
  connection.query(
    sql,
    [
      installmentsJSON,
 
      // nextduedateJSON,
      nextduedate,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating user:", err);
        return res.status(500).json({ error: "Internal Server Error" }); // Return an error response
      }
      return res.status(200).json({ updated: true }); // Return a success response
    }
  );
});
app.put("/addnewinstallments/:id", (req, res) => {
  const sql =
    "UPDATE student_details SET installments = ?, totalinstallments = ? WHERE id = ?;";
  const id = req.params.id;

  const installments = req.body.installments;
  const installmentsJSON = JSON.stringify(installments);
  const totalinstallments = req.body.totalinstallments;
  const totalinstallmentsJSON = JSON.stringify(totalinstallments);

  connection.query(
    sql,
    [installmentsJSON, totalinstallmentsJSON, id],
    (err, result) => {
      if (err) {
        console.error("Error updating user:", err);
        return res.status(500).json({ error: "Internal Server Error" }); // Return an error response
      }
      return res.status(200).json({ updated: true }); // Return a success response
    }
  );
});
app.put("/feeinstallments/:id", (req, res) => {
  const sql =
    "UPDATE student_details SET installments = ?, totalinstallments = ?, dueamount = ?, totalpaidamount = ?, nextduedate = ? WHERE id = ?;";
  const id = req.params.id;

  const installments = req.body.installments;
  const installmentsJSON = JSON.stringify(installments);
  const totalinstallments = req.body.totalinstallments;
  const totalinstallmentsJSON = JSON.stringify(totalinstallments);
  const dueamount = req.body.dueamount;
  const totalpaidamount = req.body.totalpaidamount;
  const nextduedate = req.body.nextduedate;

  connection.query(
    sql,
    [
      installmentsJSON,
      totalinstallmentsJSON,
      dueamount,
      totalpaidamount,
      nextduedate,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating user:", err);
        return res.status(500).json({ error: "Internal Server Error" }); // Return an error response
      }
      return res.status(200).json({ updated: true }); // Return a success response
    }
  );
});



// app.put("/extra_discount/:id", (req, res) => {
//   const sql =
//     "UPDATE student_details SET extra_discount = ?,installments=?, dueamount=?  WHERE id = ?;";
//   const id = req.params.id;
//   const Extra_Discount_remarks_history =
//     req.body.Extra_Discount_remarks_history;
 
//   const Extra_Discount_remarks_historyJSON = JSON.stringify(
//     Extra_Discount_remarks_history
//   );
//   const installments = req.body.installments;
//   const installmentsJSON = JSON.stringify(installments);
//   const dueamount = req.body.dueamount;
//   connection.query(
//     sql,
//     [Extra_Discount_remarks_historyJSON, installmentsJSON, dueamount, id],
//     (err, result) => {
//       if (err) {
//         console.error("Error update status:", err);
//         return res.status(500).json({ error: "Internal Server Error" }); // Return an error response
//       }
//       return res.status(200).json({ updated: true }); // Return a success response
//     }
//   );
// });



app.put("/extra_discount/:id", (req, res) => {
  const sql =
    "UPDATE student_details SET totalinstallments = ?, extra_discount = ?,installments=?, dueamount=?  WHERE id = ?;";
  const id = req.params.id;
  const totalinstallments = req.body.totalinstallments;
  const totalinstallmentsJSON = JSON.stringify(totalinstallments);
  const Extra_Discount_remarks_history =
    req.body.Extra_Discount_remarks_history;
  const Extra_Discount_remarks_historyJSON = JSON.stringify(Extra_Discount_remarks_history);
  const installments = req.body.installments;
  const installmentsJSON = JSON.stringify(installments);
  const dueamount = req.body.dueamount;
  connection.query(
    sql,
    [totalinstallmentsJSON, Extra_Discount_remarks_historyJSON, installmentsJSON, dueamount, id],
    (err, result) => {
      if (err) {
        console.error("Error update status:", err);
        return res.status(500).json({ error: "Internal Server Error" }); // Return an error response
      }
      return res.status(200).json({ updated: true }); // Return a success response
    }
  );
});


app.put("/addnewinstallments/:id", (req, res) => {
  const sql =
    "UPDATE student_details SET installments = ?, totalinstallments = ? WHERE id = ?;";
  const id = req.params.id;

  const installments = req.body.installments;
  const installmentsJSON = JSON.stringify(installments);
  const totalinstallments = req.body.totalinstallments;
  const totalinstallmentsJSON = JSON.stringify(totalinstallments);

  connection.query(
    sql,
    [installmentsJSON, totalinstallmentsJSON, id],
    (err, result) => {
      if (err) {
        console.error("Error updating user:", err);
        return res.status(500).json({ error: "Internal Server Error" }); // Return an error response
      }
      return res.status(200).json({ updated: true }); // Return a success response
    }
  );
});



// student active inactive
app.put("/studentstatus/:id", (req, res) => {
  const sql = "UPDATE student_details SET student_status = ? WHERE id = ?;";
  const id = req.params.id;
  const student_status = req.body.student_status;

  const student_statusJSON = JSON.stringify(student_status);


  connection.query(sql, [student_statusJSON, id], (err, result) => {
    if (err) {
      console.error("Error update status:", err);
      return res.status(500).json({ error: "Internal Server Error" }); // Return an error response
    }
    return res.status(200).json({ updated: true }); // Return a success response
  });
  
})


app.put("/userstatus/:id", (req, res) => {
  const sql =
    "UPDATE user SET user_remarks_history = ?, user_status = ?  WHERE id = ?;";
  const id = req.params.id;
  const user_remarks_history = req.body.user_remarks_history;
  const user_status = req.body.user_status;
 
  const user_remarks_historyJSON = JSON.stringify(user_remarks_history);
 
  connection.query(
    sql,
    [user_remarks_historyJSON, user_status, id],
    (err, result) => {
      if (err) {
        console.error("Error update status:", err);
        return res.status(500).json({ error: "Internal Server Error" }); // Return an error response
      }
      return res.status(200).json({ updated: true }); // Return a success response
    }
  );
});

// // user active inactive
// app.put("/userstatus/:id", (req, res) => {
//   const sql = "UPDATE user SET user_status = ? WHERE id = ?;";
//   const id = req.params.id;
//   const user_status = req.body.user_status;

//   const user_statusJSON = JSON.stringify(user_status);


//   connection.query(sql, [user_statusJSON, id], (err, result) => {
//     if (err) {
//       console.error("Error update status:", err);
//       return res.status(500).json({ error: "Internal Server Error" }); // Return an error response
//     }
//     return res.status(200).json({ updated: true }); // Return a success response
//   });
  
// })

// app.put("/updatestudentdata/:id", (req, res) => {
//   const sql = `UPDATE student_details SET name=?, email=?, mobilenumber=?, parentsname=?,
//     birthdate=?, gender=?, maritalstatus=?, college=?, country=?, state=?, area=?, native=?, 
//     zipcode=?, whatsappno=?, educationtype=?, marks=?, academicyear=?, 
//     enquirydate=?, enquirytakenby=?, coursepackage=?, courses=?, leadsource=?, branch=?, 
//     modeoftraining=?, registrationnumber=?, admissiondate=?, validitystartdate=?,
//      validityenddate=?, admissionremarks=?, assets=? WHERE id=?`;
//   const id = req.params.id;
//   const {
//     name,
//     email,
//     mobilenumber,
//     parentsname,
//     birthdate,
//     gender,
//     maritalstatus,
//     college,
//     country,
//     state,
//     area,
//     native,
//     zipcode,
//     whatsappno,
//     educationtype,
//     marks,
//     academicyear,
//     // profilepic,
//     enquirydate,
//     enquirytakenby,
//     coursepackage,
//     courses,
//     leadsource,
//     branch,
//     modeoftraining,
    
//     registrationnumber,
//     admissiondate,
//     validitystartdate,
//     validityenddate,
//     // feedetails,
//     // grosstotal,
//     // totaldiscount,
//     // totaltax,
//     // grandtotal,
//     admissionremarks,
//     assets,
//   } = req.body; // Destructure the request body

//   connection.query(
//     sql,
//     [
//       name,
//       email,
//       mobilenumber,
//       parentsname,
//       birthdate,
//       gender,
//       maritalstatus,
//       college,
//       country,
//       state,
//       area,
//       native,
//       zipcode,
//       whatsappno,
//       educationtype,
//       marks,
//       academicyear,
//       // profilepic,
//       enquirydate,
//       enquirytakenby,
//       coursepackage,
//       courses,
//       leadsource,
//       branch,
//       modeoftraining,
      
//       registrationnumber,
//       admissiondate,
//       validitystartdate,
//       validityenddate,
//       // feedetails,
//       // grosstotal,
//       // totaldiscount,
//       // totaltax,
//       // grandtotal,
//       admissionremarks,
//       assets,
//       id
//     ],
//     (err, result) => {
//       if (err) {
//         console.error("Error updating student data:", err);
//         return res.status(500).json({ error: "Internal Server Error" }); // Return an error response
//       }
//       return res.status(200).json({ updated: true }); // Return a success response
//     }
//   );
// });

// app.put("/updatestudentdata/:id", (req, res) => {
//   const sql = `UPDATE student_details SET name=?, email=?, mobilenumber=?, parentsname=?,
//     birthdate=?, gender=?, maritalstatus=?, college=?, country=?, state=?, area=?, native=?, 
//     zipcode=?, whatsappno=?, educationtype=?, marks=?, academicyear=?, 
//     enquirydate=?, enquirytakenby=?, coursepackage=?, courses=?, leadsource=?, branch=?, 
//     modeoftraining=?, registrationnumber=?, admissiondate=?, validitystartdate=?,
//      validityenddate=?, admissionremarks=?, assets=? WHERE id=?`;
//   const id = req.params.id;
//   const {
//     name,
//     email,
//     mobilenumber,
//     parentsname,
//     birthdate,
//     gender,
//     maritalstatus,
//     college,
//     country,
//     state,
//     area,
//     native,
//     zipcode,
//     whatsappno,
//     educationtype,
//     marks,
//     academicyear,
//     enquirydate,
//     enquirytakenby,
//     coursepackage,
//     courses,
//     leadsource,
//     branch,
//     modeoftraining,
//     registrationnumber,
//     admissiondate,
//     validitystartdate,
//     validityenddate,
//     admissionremarks,
//     assets,
//   } = req.body; // Destructure the request body

//   connection.query(
//     sql,
//     [
//       name,
//       email,
//       mobilenumber,
//       parentsname,
//       birthdate,
//       gender,
//       maritalstatus,
//       college,
//       country,
//       state,
//       area,
//       native,
//       zipcode,
//       whatsappno,
//       educationtype,
//       marks,
//       academicyear,
//       enquirydate,
//       enquirytakenby,
//       coursepackage,
//       courses,
//       leadsource,
//       branch,
//       modeoftraining,
//       registrationnumber,
//       admissiondate,
//       validitystartdate,
//       validityenddate,
//       admissionremarks,
//       assets,
//     ],
//     (err, result) => {
//       if (err) {
//         console.error("Error updating student data:", err);
//         return res.status(500).json({ error: "Internal Server Error" }); // Return an error response
//       }
//       return res.status(200).json({ updated: true }); // Return a success response
//     }
//   );
// });


app.put("/updatestudentdata/:id", (req, res) => {
  // const { filename, data } = req.body;
  const assetsJsonStringify = JSON.stringify(req.body.assets);

  const sql = `UPDATE student_details SET name=?, email=?, mobilenumber=?, parentsname=?,
    birthdate=?, gender=?, maritalstatus=?, college=?, country=?, state=?, area=?, native=?, 
    zipcode=?, whatsappno=?, educationtype=?, marks=?, academicyear=?,
    enquirydate=?, enquirytakenby=?, coursepackage=?, courses=?, leadsource=?, branch=?, 
    modeoftraining=?, registrationnumber=?, admissiondate=?, validitystartdate=?,
    validityenddate=?, admissionremarks=?, assets=? WHERE id=?`;

  const id = req.params.id;
  const {
    name,
    email,
    mobilenumber,
    parentsname,
    birthdate,
    gender,
    maritalstatus,
    college,
    country,
    state,
    area,
    native,
    zipcode,
    whatsappno,
    educationtype,
    marks,
    academicyear,
    enquirydate,
    enquirytakenby,
    coursepackage,
    courses,
    leadsource,
    branch,
    modeoftraining,
    registrationnumber,
    admissiondate,
    validitystartdate,
    validityenddate,
    admissionremarks,
  } = req.body; // Destructure the request body

  connection.query(
    sql,
    [
      name,
      email,
      mobilenumber,
      parentsname,
      birthdate,
      gender,
      maritalstatus,
      college,
      country,
      state,
      area,
      native,
      zipcode,
      whatsappno,
      educationtype,
      marks,
      academicyear,
      // filename,
      // data, // Ensure data is defined, default to an empty string if not
      enquirydate,
      enquirytakenby,
      coursepackage,
      courses,
      leadsource,
      branch,
      modeoftraining,
      registrationnumber,
      admissiondate,
      validitystartdate,
      validityenddate,
      admissionremarks,
      assetsJsonStringify,
      id, // Add id for the WHERE clause
    ],
    (err, result) => {
            if (err) {
              console.error("Error updating student data:", err);
              return res.status(500).json({ error: "Internal Server Error" }); // Return an error response
            }
            return res.status(200).json({ updated: true }); // Return a success response
          }
    // (err, result) => {
    //   if (err) {
    //     console.error("Error updating student data:", err);
    //     return res.status(500).json({ error: "Internal Server Error" });
    //   } else {
    //     if (data) {
    //       const params = {
    //         Bucket: "teksacademyimages",
    //         Key: filename,
    //         Body: Buffer.from(data, "base64"),
    //         ACL: "public-read", // Adjust the ACL as needed
    //       };

    //       s3.upload(params, (uploadErr, uploadData) => {
    //         if (uploadErr) {
    //           console.error("Error uploading to S3:", uploadErr);
    //           return res.status(500).json({ error: "Internal Server Error" });
    //         } else {
    //           console.log("Photo uploaded successfully");
    //         }
    //       });
    //     }
    //     return res.status(200).json({ updated: true });
    //   }
    // }
  );
});



// branch settings

// app.put('/settings/:id', (req, res) => {
//   const id = req.params.id;
//   const updateValues = req.body; // Assuming req.body contains the fields to update

//   const sql = 'UPDATE settings SET ? WHERE id = ?';

//   const updateValuesjson = JSON.stringify(updateValues);

//   connection.query(sql, [updateValuesjson, id], (err, result) => {
//     if (err) {
//       console.error('Error updating user:', err);
//       return res.status(500).json({ error: 'Internal Server Error' });
//     }
//     return res.status(200).json(result);
//   });
// });

// app.get('/getsettings', (req, res) => {
//   const sql = "SELECT * FROM settings";
//   connection.query(sql, (err, result) => {
//       if(err){
//         return res.json({Error: "Get userroles error in sql"});
//     }
//       return res.json(result)
//   })
// })

app.post("/addbranch", (req, res) => {
  const sql = "INSERT INTO branch_settings (branch_name) VALUES (?)";
  const values = [req.body.branch_name];

  if (!values.every((value) => value !== undefined)) {
    return res.status(422).json("Please fill in all the data");
  }
  connection.query(sql, values, (err, result) => {
    if (err) {
      console.log("err insert in addbranch: ", err);
    }
    return res.status(201).json(req.body);
  });
});

app.get("/getbranch", (req, res) => {
  const sql = "SELECT * FROM branch_settings";
  connection.query(sql, (err, result) => {
    if (err) {
      return res.json({ Error: "get branch error in sql" });
    } else {
      res.status(201).json(result);
    }
  });
});

// department

app.post("/adddepartment", (req, res) => {
  const sql = "INSERT INTO department_settings (department_name) VALUES (?)";
  const values = [req.body.department_name];

  if (!values.every((value) => value !== undefined)) {
    return res.status(422).json("fill the field");
  }

  connection.query(sql, values, (err, result) => {
    if (err) {
      return res.json({ Error: "get department error in sql" });
    } else {
      res.status(201).json(req.body);
    }
  });
});

app.get("/getdepartment", (req, res) => {
  const sql = "SELECT * FROM department_settings";
  connection.query(sql, (err, result) => {
    if (err) {
      return res.json({ Error: "get department error in sql" });
    } else {
      res.status(201).json(result);
    }
  });
});

// leadsource

app.post("/addleadsource", (req, res) => {
  const sql = "INSERT INTO leadsource_settings (leadsource) VALUES (?)";
  const values = [req.body.leadsource];

  if (!values.every((value) => value !== undefined)) {
    res.status(422).json("fill the fields");
  }

  connection.query(sql, values, (err, result) => {
    if (err) {
      return res.json({ Error: "error adding loadsource" });
    } else {
      res.status(201).json(req.body);
    }
  });
});

app.get("/getleadsource", (req, res) => {
  const sql = "SELECT * FROM leadsource_settings";

  connection.query(sql, (err, result) => {
    if (err) {
      return res.json({ Error: "get leadsource error in sql" });
    } else {
      res.status(201).json(result);
    }
  });
});



// app.post("/addcourses", (req, res) => {
//   const sql = "INSERT INTO courses_settings (course_name, fee, createdby) VALUES (?, ?, ?)";
//   const values = [req.body.course_name, req.body.fee, req.body.username];

//   if (!values.every((value) => value !== undefined)) {
//     return res.status(422).json("fill the fields");
//   }

//   connection.query(sql, values, (err, result) => {
//     if (err) {
//       return res.json({ Error: "error adding course" });
//     } else {
//       return res.status(201).json(req.body);
//     }
//   });
// });

app.post("/addcourses", (req, res) => {
  const sqlAddColumn = "ALTER TABLE courses_settings ADD COLUMN IF NOT EXISTS max_discount VARCHAR(255) DEFAULT 0";
  connection.query(sqlAddColumn, (alterErr) => {
    if (alterErr) {
      console.error("Error adding column:", alterErr);
      return res.status(500).json({ Error: "Internal Server Error" });
    }

    const sqlInsertCourse = "INSERT INTO courses_settings (course_name, fee, createdby, max_discount) VALUES (?, ?, ?, ?)";
    const values = [req.body.course_name, req.body.fee, req.body.username, req.body.max_discount];

    if (!values.every((value) => value !== undefined)) {
      return res.status(422).json("Fill all the fields");
    }

    connection.query(sqlInsertCourse, values, (err, result) => {
      if (err) {
        console.error("Error adding course:", err);
        return res.status(500).json({ Error: "Error adding course" });
      } else {
        return res.status(201).json(req.body);
      }
    });
  });
});


// app.post("/addcourses", (req, res) => {
//   const courseName = req.body.course_name;
//   const fee = req.body.fee;
//   const createdBy = req.body.username;

//   // Check if the "max_discount" column exists
//   const checkColumnQuery = "SHOW COLUMNS FROM courses_settings LIKE 'max_discount'";
  
//   connection.query(checkColumnQuery, (checkColumnErr, checkColumnResult) => {
//     if (checkColumnErr) {
//       console.error('Error checking if column exists:', checkColumnErr);
//       return res.status(500).json({ Error: 'Internal Server Error' });
//     }

//     if (checkColumnResult.length === 0) {
//       // If the column does not exist, add it using ALTER TABLE
//       const addColumnQuery = "ALTER TABLE courses_settings ADD COLUMN max_discount INT DEFAULT 0";

//       connection.query(addColumnQuery, (addColumnErr, addColumnResult) => {
//         if (addColumnErr) {
//           console.error('Error adding column:', addColumnErr);
//           return res.status(500).json({ Error: 'Internal Server Error' });
          
//         }
//         console.log("res", res);
//         // Now that the column is added, proceed with the course insertion
//         insertCourse(courseName, fee, createdBy, res);
//       });
//     } else {
//       // If the column already exists, proceed with the course insertion
//       insertCourse(courseName, fee, createdBy, res);
//     }
//   });
// });

// function insertCourse(courseName, fee, createdBy, res) {
//   const insertQuery = "INSERT INTO courses_settings (course_name, fee, createdby) VALUES (?, ?, ?)";
//   const values = [courseName, fee, createdBy];

//   if (!values.every((value) => value !== undefined)) {
//     return res.status(422).json("Fill all the fields");
//   }

//   connection.query(insertQuery, values, (err, result) => {
//     if (err) {
//       console.error('Error adding course:', err);
//       return res.json({ Error: "Error adding course" });
//     } else {
//       return res.status(201).json(req.body);
//     }
//   });
// }



// const interaktApiKey = 'Qkw5bElEanZwZVN3Q2VVUXVxdkp2eVNJN2FOdG9nQ0pQRU1xVkpCOVhXTTo=';

// const interaktApiUrl = 'https://api.interakt.com/whatsapp/send';

// app.post("/addcourses", async (req, res) => {
//   const { course_name, fee, username } = req.body;

//   // Check if any required field is missing
//   if (!course_name || !fee || !username) {
//     return res.status(422).json({ error: "Fill all the fields" });
//   }

//   const sql = "INSERT INTO courses_settings (course_name, fee, createdby) VALUES (?, ?, ?)";
//   const values = [course_name, fee, username];

//   try {
//     const result = await connection.query(sql, values);
//     const courseId = result.insertId;

//     const messageData = {
//       to: '9493991327', // Replace with the recipient's phone number
//       message: `Course "${course_name}" added by ${username}`,
//     };

//     const headers = {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${interaktApiKey}`,
//     };

//     console.log('Sending WhatsApp message:', messageData);
    
//     const response = await axios.post(interaktApiUrl, messageData, { headers, timeout: 10000 });
//     // const response = await axios.post(interaktApiUrl, messageData, { headers });

//     console.log('WhatsApp API response:', response.data);

//     return res.status(201).json({
//       success: true,
//       message: "Course added successfully",
//       course: { id: courseId, course_name, fee, createdby: username }
//     });
//   } catch (error) {
//     console.error('Error adding course or sending WhatsApp message:', error.message);
//     return res.status(500).json({ error: "Error adding course or sending WhatsApp message" });
//   }
// });





app.get("/getcourses", (req, res) => {
  const sql = "SELECT * FROM courses_settings";
  connection.query(sql, (err, result) => {
    if (err) {
      return res.json({ Error: "get courses error in sql" });
    } else {
      return res.status(201).json(result);
    }
  });
});

// coursespackage

app.post("/addcoursespackages", (req, res) => {
  const sql =
    "INSERT INTO coursepackages_settings (coursepackages_name) VALUES (?)";
  const values = [req.body.coursepackages_name];

  if (!values.every((value) => value !== undefined)) {
    return res.status(422).json("Please fill in all the data");
  }
  connection.query(sql, values, (err, result) => {
    if (err) {
      console.log("err insert in addcoursespackages: ", err);
    }
    return res.status(201).json(req.body);
  });
});

app.get("/getcoursespackages", (req, res) => {
  const sql = "SELECT * FROM coursepackages_settings";
  connection.query(sql, (err, result) => {
    if (err) {
      return res.json({ Error: "get courses error in sql" });
    } else {
      return res.status(201).json(result);
    }
  });
});

// certificates

app.put("/certificatestatus/:id", (req, res) => {
  const sql = "UPDATE student_details SET certificate_status = ? WHERE id = ?;";
  const id = req.params.id;

  const certificate_status = req.body.certificate_status;
  const certificate_statusJSON = JSON.stringify(certificate_status);

  connection.query(sql, [certificate_statusJSON, id], (err, result) => {
    if (err) {
      console.error("Error update status:", err);
      return res.status(500).json({ error: "Internal Server Error" }); // Return an error response
    }
    return res.status(200).json({ updated: true }); // Return a success response
  });
});

// reports

app.post("/createreport", (req, res) => {
 
  const reports = req.body.reports;
  const reportsJSON = JSON.stringify(reports);
  const sql =
    "INSERT INTO reports SET reports = ?";
  connection.query(
    sql,
    [reportsJSON],
    (err, result) => {
      if (err) {
        console.error("Error updating user:", err);
        return res.status(500).json({ error: "Internal Server Error" }); // Return an error response
      }
      return res.status(200).json({ updated: true }); // Return a success response
    }
  );
});

app.get("/getreports", (req, res) => {
  const sql = "SELECT * FROM reports";
 
  connection.query(sql, (err, result) => {
    if (err) {
      res.status(422).json("No data available");
    } else {
 
      const parsedResults = result.map((row) => {
        const parsedReports = JSON.parse(row.reports);
        return {
          ...row,
          reports: parsedReports,
 
        };
      });
 
      parsedResults.reverse();
      res.status(201).json(parsedResults);
    }
  });
});

app.put("/updatereport/:id", (req, res) => {
  const id = req.params.id;
  const reports = req.body.reports;
  const reportsJSON = JSON.stringify(reports);
 
  const sql =
    "UPDATE reports SET reports = ? WHERE id = ?;";
 
  connection.query(
    sql,
    [reportsJSON, id],
    (err, result) => {
      if (err) {
        console.error("Error updating user:", err);
        return res.status(500).json({ error: "Internal Server Error" }); // Return an error response
      }
      return res.status(200).json({ updated: true }); // Return a success response
    }
  );
});



app.put("/resetpassword/:id", (req, res) => {
  const sql = "UPDATE user SET password = ? WHERE id = ?;";
  const id = req.params.id;
  const plainPassword = req.body.password;
 
 
  bcrypt.hash(plainPassword, 10, (hashErr, hashedPassword) => {
    if (hashErr) {
      console.error("Error hashing password:", hashErr);
      return res.status(500).json({ error: "Internal Server Error" });
    }
 
   
    connection.query(sql, [hashedPassword, id], (updateErr, result) => {
      if (updateErr) {
        console.error("Error updating password:", updateErr);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      return res.status(200).json({ updated: true });
    });
  });
});
 

module.exports = {
  usersCreation: app,
};
