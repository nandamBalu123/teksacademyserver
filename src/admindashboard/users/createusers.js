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

// AWS.config.update({
//   accessKeyId: "AKIARCHFX7O6LLRZW5EE",
//   secretAccessKey: "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",
//   region: "us-east-1",
// });

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
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

// app.post("/student_form", (req, res) => {
//   const { filename, data } = req.body;
//   const sql = `
//     INSERT INTO student_details (
//       name, email, mobilenumber, parentsname, parentsnumber, birthdate, gender, maritalstatus,
//       college, country, state, area, native, zipcode, whatsappno, educationtype, marks,
//       academicyear, studentImg, imgData, enquirydate, enquirytakenby, coursepackage, courses, 
//       leadsource, branch, modeoftraining, registrationnumber, 
//       admissiondate, validitystartdate, validityenddate, feedetails, grosstotal,
//       totaldiscount, totaltax, grandtotal, finaltotal, admissionremarks, assets, totalinstallments,
//       dueamount, addfee, initialpayment, duedatetype, installments, materialfee,
//       feedetailsbilling, totalfeewithouttax, totalpaidamount, certificate_status, extra_discount, user_id
//     ) 
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//   `;




//   // Convert the feedetails array to JSON
//   const leadsource = req.body.leadsource;
//   const leadsourceJSON = JSON.stringify(leadsource);
//   const feedetails = req.body.feedetails;
//   const installments = req.body.installments;
//   const extra_discount = req.body.extra_discount;
//   const certificate_status = req.body.certificate_status;
//   const certificate_statusJSON = JSON.stringify(certificate_status);
//   const feedetailsbilling = req.body.feedetailsbilling;
//   const initialpayment = req.body.initialpayment;
//   const initialpaymentJSON = JSON.stringify(initialpayment);
//   const feedetailsJSON = JSON.stringify(feedetails);
//   const installmentsJSON = JSON.stringify(installments);
//   const feedetailsbillingJSON = JSON.stringify(feedetailsbilling);
//   const assets = req.body.assets;
//   const extra_discountJSON = JSON.stringify(extra_discount);
//   const assetsJSON = JSON.stringify(assets);


//   const values = [
//     req.body.name,
//     req.body.email,
//     req.body.mobilenumber,
//     req.body.parentsname,
//     req.body.parentsnumber,
//     req.body.birthdate,
//     req.body.gender,
//     req.body.maritalstatus,
//     req.body.college,
//     req.body.country,
//     req.body.state,
//     req.body.area,
//     req.body.native,
//     req.body.zipcode,
//     req.body.whatsappno,
//     req.body.educationtype,
//     req.body.marks,
//     req.body.academicyear,
//     filename,
//     data,
//     req.body.enquirydate,
//     req.body.enquirytakenby,
//     req.body.coursepackage,
//     req.body.courses,
//     leadsourceJSON,
//     req.body.branch,
//     req.body.modeoftraining,
//     req.body.registrationnumber,
//     req.body.admissiondate,
//     req.body.validitystartdate,
//     req.body.validityenddate,
//     feedetailsJSON,
//     req.body.grosstotal,
//     req.body.totaldiscount,
//     req.body.totaltax,
//     req.body.grandtotal,
//     req.body.finaltotal,
//     req.body.admissionremarks,
//     assetsJSON,
//     req.body.totalinstallments,
//     req.body.dueamount,
//     req.body.addfee,
//     initialpaymentJSON,
//     req.body.duedatetype,
//     installmentsJSON,
//     req.body.materialfee,
//     feedetailsbillingJSON,
//     req.body.totalfeewithouttax,
//     req.body.totalpaidamount,
//     certificate_statusJSON,
//     extra_discountJSON,
//     req.body.user_id,
//   ];
//   // Execute the SQL query
//   connection.query(sql, values, (insertErr, insertResult) => {
//     if (insertErr) {
//       console.error("Error in INSERT query:", insertErr);
//       return res.status(500).json("Internal Server Error");
//     }else {
//       // Upload the photo to S3
//       const params = {
//         Bucket: 'teksacademyimages',
//         Key: filename,
//         Body: Buffer.from(data, 'base64'),
//         ACL: 'public-read', // Adjust the ACL as needed
//       };

//       s3.upload(params, async (err, data) => {
//         if (err) {
//           console.error('Error uploading to S3:', err);
//           res.status(500).json({ error: 'Internal Server Error' });
//         } else {
//           await sendWelcomeMessage(req.body.name, req.body.mobilenumber);
//           // res.json({ message: 'Photo uploaded successfully' });
//         }
//       });
//     }
//     return res.status(201).json(insertResult);
//   });
// });


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

  const checkEmail = "SELECT COUNT(*) AS count FROM student_details WHERE email = ?"
  const checkMobileNumber = "SELECT COUNT(*) AS count FROM student_details WHERE mobilenumber = ?"
  const checkRgNumber = "SELECT COUNT(*) AS count FROM student_details WHERE registrationnumber = ?"


  connection.query(checkEmail, [req.body.email], (err, emailResult) => {
    if (err) {
      console.error("Error checking email in the db", err);
      return res.json({ Status: "Error" });
    }

    if (emailResult[0].count > 0) {
      console.log("Email already exists.");
      return res(500).json({ Status: "exists", field: "email" });
    }

    // Check Mobile Number
    connection.query(checkMobileNumber, [req.body.mobilenumber], (err, mobileNumberResult) => {
      if (err) {
        console.error("Error checking mobile number in the db", err);
        return res.json({ Status: "Error" });
      }

      if (mobileNumberResult[0].count > 0) {
        console.log("Mobile number already exists.");
        return res(500).json({ Status: "exists", field: "mobilenumber" });
      }

      // Check Registration Number
      connection.query(checkRgNumber, [req.body.registrationnumber], (err, rgNumberResult) => {
        if (err) {
          console.error("Error checking registration number in the db", err);
          return res.json({ Status: "Error" });
        }

        if (rgNumberResult[0].count > 0) {
          console.log("Registration number already exists.");
          return res.json({ Status: "exists", field: "registrationnumber" });
        }




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
          } else {
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
                await sendWelcomeMessage(req.body.name, req.body.whatsappno);
                res.json({ message: 'Photo uploaded successfully' });
              }
            });
            // return res.status(201).json(insertResult);
          }
          return res.status(201).json(insertResult);
        });

      });
    });
  });
});



app.get('/list_user', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const searchQuery = req.query.search || '';
    const filter = req.query.filter || {};

    const { branch, profile, department } = filter;

    const offset = (page - 1) * pageSize;
    let sqlBase = `
      FROM user
      WHERE (fullname LIKE ?
        OR email LIKE ?
        OR phonenumber LIKE ?
        OR designation LIKE ?
        OR department LIKE ?
        OR reportto LIKE ?
        OR profile LIKE ?
        OR branch LIKE ?
        OR user_remarks_history LIKE ?)
    `;
    let sqlSelect = `SELECT * ${sqlBase}`;
    const queryParams = Array(9).fill(`%${searchQuery}%`);

    // Dynamic filtering
    const filters = [];
    if (branch) {
      filters.push(`branch = ?`);
      queryParams.push(branch);
    }
    if (profile) {
      filters.push(`profile = ?`);
      queryParams.push(profile);
    }
    if (department) {
      filters.push(`department = ?`);
      queryParams.push(department);
    }
    if (filters.length) {
      sqlSelect += ` AND ${filters.join(' AND ')}`;
    }

    sqlSelect += ` LIMIT ?, ?`;
    const querySelectParams = [...queryParams, offset, pageSize];

    connection.query(sqlSelect, querySelectParams, (err, results) => {
      if (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }

      // Adjusting for searchResultUsers, we don't include LIMIT parameters
      let countSqlFiltered = `SELECT COUNT(*) AS count ${sqlBase}`;
      if (filters.length) {
        countSqlFiltered += ` AND ${filters.join(' AND ')}`;
      }

      // Execute filtered count query without pagination parameters
      connection.query(countSqlFiltered, queryParams, (err, countResultFiltered) => {
        if (err) {
          console.error('Error fetching filtered users count:', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
        const searchResultUsers = countResultFiltered[0].count;

        // Total count without any filters or search for totalUsers
        const countSqlTotal = `SELECT COUNT(*) AS count FROM user`;
        connection.query(countSqlTotal, (err, countResultTotal) => {
          if (err) {
            console.error('Error fetching total users count:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
          }

          const totalUsers = countResultTotal[0].count;
          const totalPages = Math.ceil(searchResultUsers / pageSize);
          const startUser = offset + 1;
          const endUser = startUser + results.length - 1;

          res.status(200).json({
            users: results,
            totalUsers,
            searchResultUsers,
            totalPages,
            currentPage: page,
            pageSize,
            startUser,
            endUser
          });
        });
      });
    });
  } catch (error) {
    console.error('Error fetching Users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/list_students', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const searchQuery = req.query.search || '';
    const filter = req.query.filter || {};
    const { admissionFromDate, admissiontoDate, enquiryTakenby, modeOfTraining, branch, course } = filter;

    let sql = `
      SELECT * FROM student_details
      WHERE (name LIKE ? OR
          email LIKE ? OR
          mobilenumber LIKE ? OR
          parentsname LIKE ? OR
          parentsnumber LIKE ? OR
          birthdate LIKE ? OR
          gender LIKE ? OR
          maritalstatus LIKE ? OR
          college LIKE ? OR
          country LIKE ? OR
          state LIKE ? OR
          area LIKE ? OR
          native LIKE ? OR
          zipcode LIKE ? OR
          whatsappno LIKE ? OR
          educationtype LIKE ? OR
          marks LIKE ? OR
          academicyear LIKE ? OR
          studentImg LIKE ? OR
          imgData LIKE ? OR
          enquirydate LIKE ? OR
          enquirytakenby LIKE ? OR
          coursepackage LIKE ? OR
          courses LIKE ? OR
          leadsource LIKE ? OR
          branch LIKE ? OR
          modeoftraining LIKE ? OR
          registrationnumber LIKE ? OR
          admissiondate LIKE ? OR
          validitystartdate LIKE ? OR
          validityenddate LIKE ? OR
          feedetails LIKE ? OR
          grosstotal LIKE ? OR
          totaldiscount LIKE ? OR
          totaltax LIKE ? OR
          grandtotal LIKE ? OR
          finaltotal LIKE ? OR
          admissionremarks LIKE ? OR
          assets LIKE ? OR
          totalinstallments LIKE ? OR
          dueamount LIKE ? OR
          addfee LIKE ? OR
          initialpayment LIKE ? OR
          duedatetype LIKE ? OR
          installments LIKE ? OR
          materialfee LIKE ? OR
          feedetailsbilling LIKE ? OR
          totalfeewithouttax LIKE ? OR
          totalpaidamount LIKE ? OR
          certificate_status LIKE ? OR
          extra_discount LIKE ?)
    `;

    const queryParams = Array(51).fill(`%${searchQuery}%`);

    if (branch) {
      sql += ` AND branch = ?`;
      queryParams.push(branch);
    }
    
    if(course){
        sql += ` AND courses = ?`;
        queryParams.push(course);
    }

    if (enquiryTakenby) {
      sql += ` AND enquirytakenby = ?`;
      queryParams.push(enquiryTakenby);
    }

    if (modeOfTraining) {
      sql += ` AND modeoftraining = ?`;
      queryParams.push(modeOfTraining);
    }

    // Date filter implementation
    if (admissionFromDate && admissiontoDate) {
      sql += ` AND admissiondate BETWEEN ? AND ?`;
      queryParams.push(admissionFromDate, admissiontoDate);
    }

    // Adding pagination limit and offset
    const offset = (page - 1) * pageSize;
    sql += ` LIMIT ?, ?`;
    queryParams.push(offset, pageSize);

    connection.query(sql, queryParams, (err, results) => {
      if (err) {
        console.error('Error fetching students:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }

      connection.query('SELECT COUNT(*) AS count FROM student_details', (err, totalCountResult) => {
        if (err) {
          console.error('Error fetching total student count:', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }

        const totalStudents = totalCountResult[0].count;

        let searchCountSql = `
          SELECT COUNT(*) AS count FROM student_details
          WHERE (name LIKE ?
            OR email LIKE ?
            OR mobilenumber LIKE ?
            OR parentsname LIKE ?
            OR parentsnumber LIKE ?
            OR birthdate LIKE ?
            OR gender LIKE ?
            OR maritalstatus LIKE ?
            OR college LIKE ?
            OR country LIKE ?
            OR state LIKE ?
            OR area LIKE ?
            OR native LIKE ?
            OR zipcode LIKE ?
            OR whatsappno LIKE ?
            OR educationtype LIKE ?
            OR marks LIKE ?
            OR academicyear LIKE ?
            OR studentImg LIKE ?
            OR imgData LIKE ?
            OR enquirydate LIKE ?
            OR enquirytakenby LIKE ?
            OR coursepackage LIKE ?
            OR courses LIKE ?
            OR leadsource LIKE ?
            OR branch LIKE ?
            OR modeoftraining LIKE ?
            OR registrationnumber LIKE ?
            OR admissiondate LIKE ?
            OR validitystartdate LIKE ?
            OR validityenddate LIKE ?
            OR feedetails LIKE ?
            OR grosstotal LIKE ?
            OR totaldiscount LIKE ?
            OR totaltax LIKE ?
            OR grandtotal LIKE ?
            OR finaltotal LIKE ?
            OR admissionremarks LIKE ?
            OR assets LIKE ?
            OR totalinstallments LIKE ?
            OR dueamount LIKE ?
            OR addfee LIKE ?
            OR initialpayment LIKE ?
            OR duedatetype LIKE ?
            OR installments LIKE ?
            OR materialfee LIKE ?
            OR feedetailsbilling LIKE ?
            OR totalfeewithouttax LIKE ?
            OR totalpaidamount LIKE ?
            OR certificate_status LIKE ?
            OR extra_discount LIKE ?)
        `;

        const searchCountParams = [...queryParams]; // Copy existing search parameters

        if (branch) {
          searchCountSql += ` AND branch = ?`;
          searchCountParams.push(branch);
        }
        
        if(course){
            searchCountSql += ` AND courses = ?`;
            searchCountParams.push(course);
        }

        if (enquiryTakenby) {
          searchCountSql += ` AND enquirytakenby = ?`;
          searchCountParams.push(enquiryTakenby);
        }

        if (modeOfTraining) {
          searchCountSql += ` AND modeoftraining = ?`;
          searchCountParams.push(modeOfTraining);
        }

        // Date filter implementation for search count
        if (admissionFromDate && admissiontoDate) {
          searchCountSql += ` AND admissiondate BETWEEN ? AND ?`;
          searchCountParams.push(admissionFromDate, admissiontoDate);
        }

        connection.query(searchCountSql, searchCountParams, (err, searchResultCountResult) => {
          if (err) {
            console.error('Error fetching search result student count:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
          }

          const searchResultStudents = searchResultCountResult[0].count;

          const totalPages = Math.ceil(searchResultStudents / pageSize);
          const startStudent = (page - 1) * pageSize + 1;
          const endStudent = Math.min(page * pageSize, searchResultStudents);

          res.status(200).json({
            students: results,
            totalStudents,
            searchResultStudents,
            totalPages,
            currentPage: page,
            pageSize,
            startStudent,
            endStudent
          });
        });
      });
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
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


app.get("/userdata/:id", (req, res) => {
  const userId = req.params.id;
  const sql = "SELECT * FROM user WHERE id = ?";

  connection.query(sql, [userId], (err, result) => {
    if (err) {
      res.status(422).json("Error retrieving user data");
    } else {
      if (result.length === 0) {
        res.status(404).json("User not found");
      } else {
        const row = result[0]; // Since there should be only one result
        let userRemarksHistory;
        try {
          userRemarksHistory = JSON.parse(row.user_remarks_history);
        } catch (error) {
          userRemarksHistory = ["Invalid user remarks history format"];
        }

        const parsedResult = {
          ...row,
          user_remarks_history: userRemarksHistory,
          // Add more parsed fields here if needed
        };

        res.status(200).json(parsedResult);
      }
    }
  });
});


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



// app.get("/getstudent_data", (req, res) => {
//   const sql = "SELECT * FROM student_details";
 
//   connection.query(sql, (err, result) => {
//     if (err) {
//       res.status(422).json("No data available");
//     } else {
 
//       const parsedResults = result.map((row) => {
//         // const parsedLeadsource = JSON.parse(row.leadsource);
//         let parsedLeadsource;
//         try {
//           parsedLeadsource = JSON.parse(row.leadsource);
 
//           if (!Array.Array(parsedLeadsource)) {
//             parsedLeadsource = ["leadsource is not an array"]
//           }
//         } catch (error) {
//           parsedLeadsource = ["Invalid leadsource format"]
//         }
//         const parsedTotalInstallments = JSON.parse(row.totalinstallments);
//         const parsedInstallments = JSON.parse(row.installments);
//         const parsedInitialpayment = JSON.parse(row.initialpayment);
//         const parsedcertificate_status = JSON.parse(row.certificate_status);
//         const parsedAssets = JSON.parse(row.assets);
//         const ParsedExtra_discount = JSON.parse(row.extra_discount);
//         const ParsedFeeDetails = JSON.parse(row.feedetails);
//         const ParsedFeeDetailsbilling = JSON.parse(row.feedetailsbilling);
//         let parsedRefund = row.refund
//         if (row.refund) {
//           parsedRefund = JSON.parse(row.refund);
 
//         }
 
 
//         return {
//           ...row,
//           leadsource: parsedLeadsource,
//           totalinstallments: parsedTotalInstallments,
//           installments: parsedInstallments,
//           initialpayment: parsedInitialpayment,
//           certificate_status: parsedcertificate_status,
//           assets: parsedAssets,
//           extra_discount: ParsedExtra_discount,
//           feedetails: ParsedFeeDetails,
//           feedetailsbilling: ParsedFeeDetailsbilling,
//           refund: parsedRefund
//         };
//       });
 
//       parsedResults.reverse();
//       res.status(201).json(parsedResults);
//     }
//   });
// });


app.get("/getstudent_data", (req, res) => {
  const sql = "SELECT * FROM student_details";
 
  connection.query(sql, (err, result) => {
    if (err) {
      res.status(422).json("No data available");
    } else {
 
      const parsedResults = result.map((row) => {
        // const parsedLeadsource = JSON.parse(row.leadsource);
        let parsedLeadsource;
        try {
          parsedLeadsource = JSON.parse(row.leadsource);
 
          if (!Array.Array(parsedLeadsource)) {
            parsedLeadsource = ["leadsource is not an array"]
          }
        } catch (error) {
          parsedLeadsource = ["Invalid leadsource format"]
        }
        const parsedTotalInstallments = JSON.parse(row.totalinstallments);
        const parsedInstallments = JSON.parse(row.installments);
        const parsedInitialpayment = JSON.parse(row.initialpayment);
        const parsedcertificate_status = JSON.parse(row.certificate_status);
        const parsedAssets = JSON.parse(row.assets);
        const ParsedExtra_discount = JSON.parse(row.extra_discount);
        const ParsedFeeDetails = JSON.parse(row.feedetails);
        const ParsedFeeDetailsbilling = JSON.parse(row.feedetailsbilling);
        let parsedRefund = row.refund
        if (row.refund) {
          parsedRefund = JSON.parse(row.refund);
 
        }
 
 
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
          refund: parsedRefund
        };
      });
 
      parsedResults.reverse();
      res.status(201).json(parsedResults);
    }
  });
});
 
 
 
app.get("/getstudent_data/:id", (req, res) => {
  const studentId = req.params.id;
  const sql = "SELECT * FROM student_details WHERE id = ?";
 
  connection.query(sql, [studentId], (err, result) => {
    if (err) {
      res.status(422).json("Error retrieving student data");
    } else {
      if (result.length === 0) {
        res.status(404).json("Student not found");
      } else {
        const row = result[0]; // Since there should be only one result
        let parsedLeadsource;
        try {
          parsedLeadsource = JSON.parse(row.leadsource);
 
          if (!Array.isArray(parsedLeadsource)) {
            parsedLeadsource = ["leadsource is not an array"];
          }
        } catch (error) {
          parsedLeadsource = ["Invalid leadsource format"];
        }
        
        // Parse other fields here...
        // For example:
        const parsedTotalInstallments = JSON.parse(row.totalinstallments);
        const parsedInstallments = JSON.parse(row.installments);
        const parsedInitialpayment = JSON.parse(row.initialpayment);
        const parsedCertificateStatus = JSON.parse(row.certificate_status);
        const parsedAssets = JSON.parse(row.assets);
        const parsedExtraDiscount = JSON.parse(row.extra_discount);
        const parsedFeeDetails = JSON.parse(row.feedetails);
        const parsedFeeDetailsBilling = JSON.parse(row.feedetailsbilling);
        let parsedRefund = row.refund;
        if (row.refund) {
          parsedRefund = JSON.parse(row.refund);
        }
        
        const parsedResult = {
          ...row,
          leadsource: parsedLeadsource,
          totalinstallments: parsedTotalInstallments,
          installments: parsedInstallments,
          initialpayment: parsedInitialpayment,
          certificate_status: parsedCertificateStatus,
          assets: parsedAssets,
          extra_discount: parsedExtraDiscount,
          feedetails: parsedFeeDetails,
          feedetailsbilling: parsedFeeDetailsBilling,
          refund: parsedRefund
          // Add more parsed fields as needed...
        };
 
        res.status(200).json(parsedResult);
      }
    }
  });
});


// app.get("/getUser_data/:id", (req, res) => {
//   const userId = req.params.id;
//   const sql = "SELECT * FROM user WHERE id = ?";

//   connection.query(sql, [userId], (err, result) => {
//     if(err){
//       res.status(422).json("Error retrieving user data");
//     }else {
//       if(result.length === 0){
//         res.status(404).json("user not found")
//       }else {
//         const row = result[0];
//         let parsedUserStatus;
//         try{
//           parsedUserStatus = JSON.parse(row.userRemarksHistory)
//         }
//       }
//     }
//   })
// })





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




// app.post('/studentfeerefund', (req, res) => {
//   const { refund } = req.body;
//   const refundJSON = JSON.stringify(refund)
//   const regNum = refund[0].registrationnumber;

//   if (!refund) {
//     return res.status(400).json({ error: 'Registration number and refund amount are required.' });
//   }

//   const checkQuery = 'SELECT * FROM student_details WHERE registrationnumber = ?';

//   connection.query(checkQuery, [regNum], (err, results) => {
//     if (err) {
//       console.error('Error checking registration number:', err);
//       return res.status(500).json({ error: 'Internal Server Error' });
//     }

//     if (results.length === 0) {
//       const createTableQuery = 'CREATE TABLE IF NOT EXISTS refunds (id INT AUTO_INCREMENT PRIMARY KEY, refund TEXT)';

//       connection.query(createTableQuery, (createErr) => {
//         if (createErr) {
//           console.error('Error creating refund table:', createErr);
//           return res.status(500).json({ error: 'Internal Server Error' });
//         }

//         const insertQuery = 'INSERT INTO refund (refund) VALUES (?)';
//         connection.query(insertQuery, [refundJSON], (insertErr) => {
//           if (insertErr) {
//             console.error('Error inserting refund record:', insertErr);
//             return res.status(500).json({ error: 'Internal Server Error' });
//           }

//           return res.json({ message: `Refund record inserted for registration number ${regNum}` });
//         });
//       });
//     } else {

//       const updateQuery = 'UPDATE student_details SET refund = ? WHERE registrationnumber = ?';

//       // Create the refund column if it doesn't exist
//       const createRefundColumnQuery = `
//         ALTER TABLE student_details
//         ADD COLUMN IF NOT EXISTS refund TEXT;
//       `;

//       connection.query(createRefundColumnQuery, (createColumnErr) => {
//         if (createColumnErr) {
//           console.error('Error creating refund column:', createColumnErr);
//           return res.status(500).json({ error: 'Internal Server Error ' });
//         }

//         // Now update the refund for the specified registration number
//         connection.query(updateQuery, [refundJSON, regNum], (updateErr) => {
//           if (updateErr) {
//             console.error('Error updating student_details:', updateErr);
//             return res.status(500).json({ error: 'Internal Server Error' });
//           }

//           return res.json({ message: `Refund updated for registration number ${regNum}` });
//         });
//       });
//     }
//   });
// });

 
 
app.post('/studentfeerefund', (req, res) => {
  const { refund, registrationnumber } = req.body;
  const refundJSON = JSON.stringify(refund);
  const regNum = refund[0].registrationnumber;
 
  if (!refund || !registrationnumber) {
    return res.status(400).json({ error: 'Registration number and refund amount are required.' });
  }
 
  const checkQuery = 'SELECT * FROM student_details WHERE registrationnumber = ?';
 
  connection.query(checkQuery, [regNum], (err, results) => {
    if (err) {
      console.error('Error checking registration number:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
 
    if (results.length === 0) {
      const createTableQuery = 'CREATE TABLE IF NOT EXISTS refunds (id INT AUTO_INCREMENT PRIMARY KEY, registrationnumber TEXT, refund TEXT)';
 
      connection.query(createTableQuery, (createErr) => {
        if (createErr) {
          console.error('Error creating refund table:', createErr);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
 
        const insertQuery = 'INSERT INTO refunds (registrationnumber, refund) VALUES (?, ?)';
        connection.query(insertQuery, [registrationnumber, refundJSON], (insertErr) => {
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

// app.put("/refundpermissions/:registrationnumber", (req, res) => {
//   const registrationnumber = req.params.registrationnumber;
//   const refund = req.body.refund;
//   const refundJSON = JSON.stringify(refund);

//   // Check if registrationnumber exists in student_details
//   const checkStudentQuery = "SELECT * FROM student_details WHERE registrationnumber = ?";

//   connection.query(checkStudentQuery, [registrationnumber], (checkErr, checkResult) => {
//     if (checkErr) {
//       console.error("Error checking student details:", checkErr);
//       return res.status(500).json({ error: "Internal Server Error" });
//     }

//     if (checkResult.length === 0) {
//       // If registrationnumber not found in student_details, update refund table
//       // const updateRefundQuery = "UPDATE refund SET refund = ? WHERE registrationnumber = ?";
//       const updateRefundQuery = "UPDATE refund SET refund = ? WHERE JSON_EXTRACT(refund, '$[0].registrationnumber') = ?";
//       connection.query(updateRefundQuery, [refundJSON, registrationnumber], (updateErr, updateResult) => {
//         if (updateErr) {
//           console.error("Error updating refund table:", updateErr);
//           return res.status(500).json({ error: "Internal Server Error" });
//         }

//         return res.status(200).json({ updated: true });
//       });
//     } else {
//       // Registration number exists in student_details, return an appropriate response
//       return res.status(404).json({ error: "Registration Number already exists in student_details" });
//     }
//   });
// });



app.put("/refundpermissions/:registrationnumber", (req, res) => {
  const registrationnumber = req.params.registrationnumber;
  const refund = req.body.refund;
  const refundJSON = JSON.stringify(refund);
 
  // Check if registrationnumber exists in student_details
  const checkStudentQuery = "SELECT * FROM student_details WHERE registrationnumber = ?";
 
  connection.query(checkStudentQuery, [registrationnumber], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Error checking student details:", checkErr);
      return res.status(500).json({ error: "Internal Server Error" });
    }
 
    if (checkResult.length === 0) {
      // If registrationnumber not found in student_details, update refund table
      const updateRefundQuery = "UPDATE refunds SET refund = ? WHERE registrationnumber = ?";
      connection.query(updateRefundQuery, [refundJSON, registrationnumber], (updateErr, updateResult) => {
        if (updateErr) {
          console.error("Error updating refund table:", updateErr);
          return res.status(500).json({ error: "Internal Server Error" });
        }
 
        return res.status(200).json({ updated: true });
      });
    } else {
      // Registration number exists in student_details, update student_details table
      const updateStudentQuery = "UPDATE student_details SET refund = ? WHERE registrationnumber = ?";
      connection.query(updateStudentQuery, [refundJSON, registrationnumber], (updateErr, updateResult) => {
        if (updateErr) {
          console.error("Error updating student_details table:", updateErr);
          return res.status(500).json({ error: "Internal Server Error" });
        }
 
        return res.status(200).json({ updated: true });
      });
    }
  });
});



app.get("/studentrefundsfromrefunds", (req, res) => {
  const sqlRefund = "SELECT refund FROM refunds ORDER BY id DESC";
  const sqlExistingStudents = "SELECT refund FROM student_details ORDER BY id DESC";
 
  connection.query(sqlRefund, (errRefund, resultRefund) => {
    if (errRefund) {
      res.status(422).json({ error: "Error fetching refund data" });
    } else {
      const parsedRefundResults = resultRefund.map((row) => {
        const refund = JSON.parse(row.refund);
        return {
          ...row,
          refund: refund,
        };
      });
 
      connection.query(sqlExistingStudents, (errStudents, resultStudents) => {
        if (errStudents) {
          res.status(422).json({ error: "Error fetching student data" });
        } else {
          const filteredData = resultStudents.filter(item => item.refund !== null);
          const parsedStudentResults = filteredData.map((row) => {
            const refund = JSON.parse(row.refund);
            return {
              ...row,
              refund: refund,
            };
 
 
          });
 
          // Combine results from both queries and send a single response
 
          let mergedData = [
            ...parsedRefundResults,
            ...parsedStudentResults
          ];
          mergedData = mergedData.sort((a, b) => new Date(b.refund[0].date) - new Date(a.refund[0].date));
          res.status(200).json(mergedData);
        }
      });
    }
  });
});
 

app.get("/singlerefundview/:registrationnumber", (req, res) => {
  const { registrationnumber } = req.params;
 
  if (!registrationnumber) {
    return res.status(400).json({ error: 'Registration number is required.' });
  }
 
  const sqlRefund = "SELECT refund FROM refunds WHERE registrationnumber = ? ORDER BY id DESC";
  const sqlExistingStudents = "SELECT refund FROM student_details WHERE registrationnumber = ? ORDER BY id DESC";
 
  connection.query(sqlRefund, [registrationnumber], (errRefund, resultRefund) => {
    if (errRefund) {
      return res.status(422).json({ error: "Error fetching refund data" });
    }
 
    const parsedRefundResults = resultRefund.map((row) => {
      const refund = JSON.parse(row.refund);
      return {
        ...row,
        refund: refund,
      };
    });
 
    connection.query(sqlExistingStudents, [registrationnumber], (errStudents, resultStudents) => {
      if (errStudents) {
        return res.status(422).json({ error: "Error fetching student data" });
      }
 
      const filteredData = resultStudents.filter(item => item.refund !== null);
      const parsedStudentResults = filteredData.map((row) => {
        const refund = JSON.parse(row.refund);
        return {
          ...row,
          refund: refund,
        };
      });
 
      // Combine results from both queries and send a single response
      let mergedData;
      if (parsedRefundResults.length !== 0) {
        mergedData = [
          ...parsedRefundResults,
        ];
 
      }
      else {
        mergedData = [
          ...parsedStudentResults,
        ];
      }
 
      // Sorting based on a field (replace 'date' with the actual field you want to sort by)
      mergedData = mergedData.sort((a, b) => new Date(b.date) - new Date(a.date));
 
      return res.status(200).json(mergedData);
    });
  });
});
 
 
 
 


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







// courses setting
app.post("/addcourses", (req, res) => {
  const sql = "INSERT INTO courses_settings (course_name, course_package, fee, max_discount, createdby) VALUES (?, ?, ?, ?, ?)";
  const values = [req.body.course_name, req.body.course_package, req.body.fee, req.body.max_discount, req.body.createdby];

  if (!values.every((value) => value !== undefined)) {
    return res.status(422).json("fill the fields");
  }

  connection.query(sql, values, (err, result) => {
    if (err) {
      return res.json({ Error: "error adding course" });
    } else {
      return res.status(201).json(req.body);
    }
  });
});


app.get("/getcourses", (req, res) => {
  const sql = "SELECT * FROM courses_settings";
  connection.query(sql, (err, result) => {
    if (err) {
      return res.json({ Error: "get courses error in sql" });
    } else {
      return res.status(200).json(result);
    }
  });
});

app.get("/getcourse/:id", (req, res) => {
  const id = req.params.id;
  const sqlGetCourse = "SELECT * FROM courses_settings WHERE id = ?";
 
  connection.query(sqlGetCourse, [id], (err, result) => {
    if (err) {
      console.error("Error retrieving course:", err);
      return res.status(500).json({ Error: "Error retrieving course" });
    } else {
      if (result.length === 0) {
        return res.status(404).json({ Error: "Course not found" });
      }
      const course = result[0];
      return res.status(200).json(course);
    }
  });
});
 
 
app.put("/updatecourse/:id", (req, res) => {
  const id = req.params.id;
  const sqlUpdateCourse = "UPDATE courses_settings SET course_name=?, fee=?, createdby=?, max_discount=?, course_package=? WHERE id=?";
  const values = [
    req.body.course_name,
    req.body.fee,
    req.body.createdby,
    req.body.max_discount,
    req.body.course_package,
    id
  ];
 
  if (values.slice(0, -1).some((value) => value === undefined || value === null)) {
    return res.status(422).json({ error: "Fill all the fields" });
  }
 
  connection.query(sqlUpdateCourse, values, (err, result) => {
    if (err) {
      console.error("Error updating course:", err);
      return res.status(500).json({ Error: "Error updating course" });
    } else {
      if (result.affectedRows === 0) {
        return res.status(404).json({ Error: "Course not found" });
      }
      return res.status(200).json({ message: "Course updated successfully" });
    }
  });
});
 

app.delete("/deletecourse/:id", (req, res) => {
  const courseId = req.params.id;

  if (!courseId) {
    return res.status(422).json({ error: "Course ID is required" });
  }

  const sqlDeleteCourse = "DELETE FROM courses_settings WHERE id = ?";
  connection.query(sqlDeleteCourse, [courseId], (err, result) => {
    if (err) {
      console.error("Error deleting course:", err);
      return res.status(500).json({ Error: "Error deleting course" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ Error: "Course not found" });
    }

    return res.status(200).json({ message: "Course deleted successfully" });
  });
});



// coursespackage

app.post("/addcoursespackages", (req, res) => {
  const sql =
    "INSERT INTO coursepackages_settings (coursepackages_name, createdby) VALUES (?, ?)";
  const values = [req.body.coursepackages_name, req.body.createdby];

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


app.get("/getcoursepackages/:id", (req, res) => {
  const id = req.params.id;
  const sqlGetCourse = "SELECT * FROM coursepackages_settings WHERE id = ?";
 
  connection.query(sqlGetCourse, [id], (err, result) => {
    if (err) {
      console.error("Error retrieving course:", err);
      return res.status(500).json({ Error: "Error retrieving course" });
    } else {
      if (result.length === 0) {
        return res.status(404).json({ Error: "Course not found" });
      }
      const course = result[0];
      return res.status(200).json(course);
    }
  });
});

app.get("/getcoursespackages", (req, res) => {
  const sql = "SELECT * FROM coursepackages_settings";
  connection.query(sql, (err, result) => {
    if (err) {
      return res.json({ Error: "get courses error in sql" });
    } else {
      return res.status(200).json(result);
    }
  });
});

app.delete("/deletecoursepackage/:id", (req, res) => {
  const courseId = req.params.id;

  if (!courseId) {
    return res.status(422).json({ error: "Course ID is required" });
  }

  const sqlDeleteCourse = "DELETE FROM coursepackages_settings WHERE id = ?";
  connection.query(sqlDeleteCourse, [courseId], (err, result) => {
    if (err) {
      console.error("Error deleting course:", err);
      return res.status(500).json({ Error: "Error deleting course" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ Error: "coursepackages not found" });
    }

    return res.status(200).json({ message: "coursepackages deleted successfully" });
  });
});

app.put("/updatecoursepackages/:id", (req, res) => {
  const id = req.params.id;
  const sqlUpdateCourse = "UPDATE coursepackages_settings SET coursepackages_name=? WHERE id=?";
  const values = [
    req.body.coursepackages_name,
    id
  ];
 
  if (values.slice(0, -1).some((value) => value === undefined || value === null)) {
    return res.status(422).json({ error: "Fill all the fields" });
  }
 
  connection.query(sqlUpdateCourse, values, (err, result) => {
    if (err) {
      console.error("Error updating course:", err);
      return res.status(500).json({ Error: "Error updating course" });
    } else {
      if (result.affectedRows === 0) {
        return res.status(404).json({ Error: "Course not found" });
      }
      return res.status(200).json({ message: "Course updated successfully" });
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
      res.status(200).json(result);
    }
  });
});



app.get("/getleadsource/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM leadsource_settings WHERE id = ?";

  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error retrieving lead source", err)
      return res.json({ Error: "get leadsource error in sql" });
    } else {
      if(result.length === 0){
        return res.status(404).json({Error: "Lead Source not found"})
      }
      const course = result[0];
      return res.status(200).json(course);
    }
  });
});



app.put("/updatedleadsource/:id", (req, res) => {
  const id = req.params.id;
  const sql = "UPDATE leadsource_settings SET leadsource = ? WHERE id=?";
  const values = [req.body.leadsource, id];

  if(values.slice(0, -1).some((value) => value === undefined || value === null)){
    return res.status(422).json({error: "fill all the fields"});
  }
  
  connection.query(sql, values, (err, result) => {
    if(err){
      console.error(("Error updating leadsource: ", err))
      return res.json({ Error: "get leadsource error in sql" });
    }else{
      if(result.affectedRows === 0){
        return res.status(404).json({ Error: "Lead Source not found"})
      }
      
      return res.status(200).json({ message: "Lead Sourse updated successfully"})
    }
  })
})



app.delete("/deleteleadsource/:id", (req, res) => {
  const id = req.params.id;

  if(!id){
    return res.status(422).json({ error: "id is required"})
  }

  const sql = "DELETE FROM leadsource_settings WHERE id = ?"

  connection.query(sql, [id], (err, result) => {
    if(err){
      console.error(("Error deleting leadsource: ", err))
      return res.status(500).json({ Error: "delete leadsource error in sql" });
    }

      if(result.affectedRows === 0){
        return res.status(401).json({ Error: "Leadsource not found"});
      }
    
      return res.status(200).json({ message: "leadsource delete successfully"})
  })
})

// department

app.post("/adddepartment", (req, res) => {
  const sql = "INSERT INTO department_settings (department_name, description, createdby) VALUES (?, ?, ?)";
  const values = [req.body.department_name, req.body.description, req.body.createdby];

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
      res.status(200).json(result);
    }
  });
});



app.get("/getdepartment/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM department_settings WHERE id = ?";

  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error retrieving lead source", err)
      return res.json({ Error: "get department error in sql" });
    } else {
      if(result.length === 0){
        return res.status(404).json({Error: "department not found"})
      }
      const course = result[0];
      return res.status(200).json(course);
    }
  });
});



app.put("/updatedepartment/:id", (req, res) => {
  const id = req.params.id;
  const sql = "UPDATE department_settings SET department_name = ?, description = ?, createdby = ? WHERE id=?";
  const values = [req.body.department_name, req.body.description, req.body.createdby, id];

  if(values.slice(0, -1).some((value) => value === undefined || value === null)){
    return res.status(422).json({error: "fill all the fields"});
  }
  
  connection.query(sql, values, (err, result) => {
    if(err){
      console.error(("Error updating leadsource: ", err))
      return res.json({ Error: "get leadsource error in sql" });
    }else{
      if(result.affectedRows === 0){
        return res.status(404).json({ Error: "Lead Source not found"})
      }
     
      return res.status(200).json({ message: "Lead Sourse updated successfully"})
    }
  })
})



app.delete("/deletedepartment/:id", (req, res) => {
  const id = req.params.id;

  if(!id){
    return res.status(422).json({ error: "id is required"})
  }

  const sql = "DELETE FROM department_settings WHERE id = ?"

  connection.query(sql, [id], (err, result) => {
    if(err){
      console.error(("Error deleting department: ", err))
      return res.status(500).json({ Error: "delete department error in sql" });
    }

      if(result.affectedRows === 0){
        return res.status(401).json({ Error: "department not found"});
      }
    
      return res.status(200).json({ message: "department delete successfully"})
  })
})



// branch

app.post("/addbranch", (req, res) => {
  const sql = "INSERT INTO branch_settings (branch_name, description, createdby) VALUES (?, ?, ?)";
  const values = [req.body.branch_name, req.body.description, req.body.createdby];

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
      res.status(200).json(result);
    }
  });
});


app.get("/getbranch/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM branch_settings WHERE id = ?";

  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error retrieving branch", err)
      return res.json({ Error: "get branch error in sql" });
    } else {
      if(result.length === 0){
        return res.status(404).json({Error: "branch not found"})
      }
      const course = result[0];
      return res.status(200).json(course);
    }
  });
});



app.put("/updatebranch/:id", (req, res) => {
  const id = req.params.id;
  const sql = "UPDATE branch_settings SET branch_name = ?, description = ?, createdby = ? WHERE id=?";
  const values = [req.body.branch_name, req.body.description, req.body.createdby, id];

  if(values.slice(0, -1).some((value) => value === undefined || value === null)){
    return res.status(422).json({error: "fill all the fields"});
  }
  
  connection.query(sql, values, (err, result) => {
    if(err){
      console.error(("Error updating branch: ", err))
      return res.json({ Error: "get branch error in sql" });
    }else{
      if(result.affectedRows === 0){
        return res.status(404).json({ Error: "branch not found"})
      }
     
      return res.status(200).json({ message: "branch updated successfully"})
    }
  })
})



app.delete("/deletebranch/:id", (req, res) => {
  const id = req.params.id;

  if(!id){
    return res.status(422).json({ error: "id is required"})
  }

  const sql = "DELETE FROM branch_settings WHERE id = ?"

  connection.query(sql, [id], (err, result) => {
    if(err){
      console.error(("Error deleting department: ", err))
      return res.status(500).json({ Error: "delete branch error in sql" });
    }

      if(result.affectedRows === 0){
        return res.status(401).json({ Error: "branch not found"});
      }
    
      return res.status(200).json({ message: "branch delete successfully"})
  })
})


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


// const nodemailer = require('nodemailer');
const razorpay = require('razorpay');

// // payment gatway

// // Razorpay setup
// const razorpayKey = 'rzp_test_HXWg7EjjGBM1JY';
// const razorpaySecret = 'EdTfexoyKzGAADPD3SjidgUX';

// const razorpayInstance = new razorpay({
//   key_id: razorpayKey,
//   key_secret: razorpaySecret,
// });

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'nirajkr00024@gmail.com',
//     pass: 'fkjj xtju fauu tgai'
//   },
// });

// app.post('/create-order', async (req, res) => {
//   const { amount: reqAmount, currency: reqCurrency, studentEmail } = req.body;

//   const razorpayBaseUrl = 'https://api.razorpay.com/v1';
//   const razorpayCreateOrderUrl = `${razorpayBaseUrl}/orders`;

//   const headers = {
//     Authorization: `Basic ${Buffer.from(`${razorpayKey}:${razorpaySecret}`).toString('base64')}`,
//     'Content-Type': 'application/json',
//   };

//   try {
//     // Create an order using Razorpay API
//     const response = await axios.post(razorpayCreateOrderUrl, {
//       amount: reqAmount * 100, // Amount in paise
//       currency: reqCurrency,
//     }, {
//       headers,
//     });
//     console.log('Razorpay API response:', response.data);
//     const { id, amount, currency, short_url } = response.data;
//     const paymentLink = `https://teksacademy.com/pay/${id}`; // Replace with your actual domain
//     // Send payment link to student via email
//     const mailOptions = {
//       from: 'nbkrishna32@gmail.com', // Replace with your email
//       to: studentEmail,
//       subject: 'Payment Link',
//       text: `Click on the link to make the payment: ${paymentLink}`,
//     };

//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//       } else {
//         console.log('Email sent: ' + info.response);
//         res.json({ id, amount, currency, paymentLink  });
//       }
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });


// // Routes
// app.post('/create-order', async (req, res) => {
//   const amount = req.body.amount; // Amount in paise

//   const options = {
//     amount: amount,
//     currency: 'INR', // Change currency as needed
//   };

//   try {
//     const order = await razorpayInstance.orders.create(options);
//     res.json({ order });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// app.post('/capture-payment', async (req, res) => {
//   const paymentId = req.body.payment_id;
//   const orderId = req.body.order_id;

//   try {
//     const payment = await razorpayInstance.payments.capture(paymentId, orderId);
//     res.json({ payment });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });




module.exports = {
  usersCreation: app,
};
