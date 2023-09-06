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


// // inventory
// app.post('/create', (req, res) => {
//   const sql = "INSERT INTO inventory (name,vendername, designation, branch, assettype, brandname, issueddate, assetcode, anonymity,returndate, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?,?)";
//   const values = [req.body.name, req.body.vendername, req.body.designation, req.body.branch, req.body.assettype, req.body.brandname, req.body.issueddate, req.body.assetcode, req.body.anonymity, req.body.remarks, req.body.returndate];
  
//   if (!values.every(value => value !== undefined)) {
//     return res.status(422).json("Please fill in all the data");
//   }

//   const selectQuery = "SELECT * FROM inventory WHERE designation = ?";
// //  selectResult
//   connection.query(selectQuery, req.body.designation, (selectErr) => {
//     if (selectErr) {
//       console.log("Error in SELECT query: ", selectErr);
//       return res.status(500).json("Internal Server Error");
//     }

//     // if (selectResult.length) {
//     //   return res.status(422).json("This data already exists");
//     // }

//     connection.query(sql, values, (insertErr, insertResult) => {
//       if (insertErr) {
//         console.log("Error in INSERT query: ", insertErr);
//         return res.status(500).json("Internal Server Error");
//       }

//       return res.status(201).json(req.body);
//     });
//   });
// });





// app.get("/getassets",(req,res)=>{

//   connection.query("SELECT * FROM assignassets",(err,result)=>{
//       if(err){
//           res.status(422).json("nodata available");
//       }else{
//           res.status(201).json(result);
//       }
//   })
// });

// app.get("/viewassets/:id",(req,res)=>{

//   const {id} = req.params;

//   connection.query("SELECT * FROM assignassets WHERE id = ? ",id,(err,result)=>{
//       if(err){
//           res.status(422).json("error");
//       }else{
//           res.status(201).json(result);
//       }
//   })
// });

// app.patch("/updatassignassets/:id",(req,res)=>{

//   const {id} = req.params;

//   const data = req.body;

//   connection.query("UPDATE assignassets SET ? WHERE id = ?",[data,id],(err,result)=>{
//       if(err){
//           res.status(422).json({message:"error"});
//       }else{
//         const { name,vendername, designation, branch, assettype, brandname, issueddate, assetcode, anonymity, remarks,returndate } = req.body;

//         connection.beginTransaction((err) => {
//           if (err) {
//             // Handle error and rollback transaction if necessary
//             res.status(422).json({ message: "error" });
//             return;
//           }
  
//           // Step 1: Insert data into the inventory table
//           connection.query("INSERT INTO inventory (name,vendername, designation, branch, assettype, brandname, issueddate, assetcode, anonymity, returndate, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)",
//             [name, vendername, designation, branch, assettype, brandname, issueddate, assetcode, anonymity,returndate, remarks],
//             (err, insertResult) => {
//               if (err) {
//                 // Step 2: Rollback the transaction if the INSERT operation fails
//                 connection.rollback(() => {
//                   res.status(422).json({ message: "error" });
//                 });
//               } else {
//                 // Step 3: If the INSERT operation is successful, delete the data from assignassets
//                 connection.query("DELETE FROM assignassets WHERE id = ?", [id], (err, deleteResult) => {
//                   if (err) {
//                     // Step 4: Rollback the transaction if the DELETE operation fails
//                     connection.rollback(() => {
//                       res.status(422).json({ message: "error" });
//                     });
//                   } else {
//                     // Step 5: Commit the transaction if both INSERT and DELETE operations are successful
//                     connection.commit((err) => {
//                       if (err) {
//                         // Handle error and rollback the transaction if necessary
//                         connection.rollback(() => {
//                           res.status(422).json({ message: "error" });
//                         });
//                       } else {
//                         // Step 6: Respond with the successful result or any other response you want
//                         res.status(201).json(insertResult);
//                       }
//                     });
//                   }
//                 });
//               }
//             }
//           );
//         });

//       }
//   })
// });

// app.delete("/deleteasset/:id",(req,res)=>{

//   const {id} = req.params;

//   connection.query("DELETE FROM assignassets WHERE id = ? ",id,(err,result)=>{
//       if(err){
//           res.status(422).json("error");
//       }else{
//           res.status(201).json(result);
//       }
//   })
// });


// app.post('/assignasset', (req, res) => {
//   // const sqlInsert = "INSERT INTO assignassets (name, designation, branch, assettype, brandname, issueddate, assetcode, anonymity, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
//   const valuesInsert = [req.body.name, req.body.vendername, req.body.designation, req.body.branch, req.body.assettype, req.body.brandname, req.body.issueddate, req.body.assetcode, req.body.anonymity, req.body.remarks];
  
//   // if (!valuesInsert.every(value => value !== undefined)) {
//   //   return res.status(422).json("Please fill in all the data");
//   // }
// if(req.body.assettype == 'laptop'){


//   const sqlInsert = "INSERT INTO assignassets (name,vendername, designation, branch, assettype, brandname, issueddate, assetcode, anonymity, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)";
//   const valuesInsert = [req.body.name, req.body.vendername, req.body.designation, req.body.branch, req.body.assettype, req.body.brandname, req.body.issueddate, req.body.assetcode, req.body.anonymity, req.body.remarks];
//   // Query to fetch the quantity of the asset in the inventory table
//   const sqlSelect = "SELECT anonymity FROM inventory WHERE brandname = ?";
//   connection.query(sqlSelect, req.body.brandname, (selectErr, selectResult) => {
//     if (selectErr) {
//       console.log("Error in SELECT query: ", selectErr);
//       return res.status(500).json("Internal Server Error");
//     }

//     if (selectResult.length === 0) {
//       return res.status(404).json("Asset not found in the inventory");
//     }

//     const quantityInInventory = selectResult[0].anonymity || 0;

//     // If the quantity in the inventory is less than or equal to 0, return an error
//     if (quantityInInventory <= 0) {
//       return res.status(422).json("Insufficient quantity in the inventory");
//     }



// // Calculate the remaining quantity in the inventory after moving data to assignassets
// const remainingQuantity = quantityInInventory - req.body.anonymity;

// if (remainingQuantity <= 0) {
//   // If remaining quantity is 0 or less, delete the row from the inventory table
//   const sqlDelete = "DELETE FROM inventory WHERE brandname = ? AND assetcode = ?";
//   connection.query(sqlDelete, [req.body.brandname, req.body.assetcode], (deleteErr, deleteResult) => {
//     if (deleteErr) {
//       console.log("Error in DELETE query: ", deleteErr);
//       return res.status(500).json("Internal Server Error");
//     }

//     // Insert data into the assignassets table
//     connection.query(sqlInsert, valuesInsert, (insertErr, insertResult) => {
//       if (insertErr) {
//         console.log("Error in INSERT query: ", insertErr);
//         return res.status(500).json("Internal Server Error");
//       }

//       // Handle successful insertion into assignassets table here
//       return res.status(200).json("Data moved successfully");
//     });
//   });
// } else {
//   // Update the quantity in the inventory table
//   const sqlUpdate = "UPDATE inventory SET anonymity = ? WHERE brandname = ? AND assetcode = ?";
//   connection.query(sqlUpdate, [remainingQuantity, req.body.brandname, req.body.assetcode], (updateErr, updateResult) => {
//     if (updateErr) {
//       console.log("Error in UPDATE query: ", updateErr);
//       return res.status(500).json("Internal Server Error");
//     }

//     // Insert data into the assignassets table
//     connection.query(sqlInsert, valuesInsert, (insertErr, insertResult) => {
//       if (insertErr) {
//         console.log("Error in INSERT query: ", insertErr);
//         return res.status(500).json("Internal Server Error");
//       }

//       // Handle successful insertion into assignassets table here
//       return res.status(200).json("Data moved successfully");
//     });
//   });
// }
// });


// }


// // for shirt

// if(req.body.assettype === 'shirt'){
//   const sqlInsert = "INSERT INTO assignassets (name,vendername, designation, branch, assettype, brandname, issueddate, assetcode, anonymity, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
//   const valuesInsert = [req.body.name, req.body.vendername, req.body.designation, req.body.branch, req.body.assettype, req.body.brandname, req.body.issueddate, req.body.assetcode, req.body.anonymity, req.body.remarks];
//   // Query to fetch the quantity of the asset in the inventory table
//   const sqlSelect = "SELECT anonymity FROM inventory WHERE assettype = ?";
//   connection.query(sqlSelect, req.body.assettype, (selectErr, selectResult) => {
//     if (selectErr) {
//       console.log("Error in SELECT query: ", selectErr);
//       return res.status(500).json("Internal Server Error");
//     }

//     if (selectResult.length === 0) {
//       return res.status(404).json("Asset not found in the inventory");
//     }

//     const quantityInInventory = selectResult[0].anonymity || 0;

//     // If the quantity in the inventory is less than or equal to 0, return an error
//     if (quantityInInventory <= 0) {
//       return res.status(422).json("Insufficient quantity in the inventory");
//     }



// // Calculate the remaining quantity in the inventory after moving data to assignassets
// const remainingQuantity = quantityInInventory - req.body.anonymity;

// if (remainingQuantity <= 0) {
//   // If remaining quantity is 0 or less, delete the row from the inventory table
//   const sqlDelete = "DELETE FROM inventory WHERE assettype = ?";
//   connection.query(sqlDelete, [req.body.assettype], (deleteErr, deleteResult) => {
//     if (deleteErr) {
//       console.log("Error in DELETE query: ", deleteErr);
//       return res.status(500).json("Internal Server Error");
//     }

//     // Insert data into the assignassets table
//     connection.query(sqlInsert, valuesInsert, (insertErr, insertResult) => {
//       if (insertErr) {
//         console.log("Error in INSERT query: ", insertErr);
//         return res.status(500).json("Internal Server Error");
//       }

//       // Handle successful insertion into assignassets table here
//       return res.status(200).json("Data moved successfully");
//     });
//   });
// } else {
//   // Update the quantity in the inventory table
//   const sqlUpdate = "UPDATE inventory SET anonymity = ? WHERE assettype = ?";
//   connection.query(sqlUpdate, [remainingQuantity, req.body.assettype], (updateErr, updateResult) => {
//     if (updateErr) {
//       console.log("Error in UPDATE query: ", updateErr);
//       return res.status(500).json("Internal Server Error");
//     }

//     // Insert data into the assignassets table
//     connection.query(sqlInsert, valuesInsert, (insertErr, insertResult) => {
//       if (insertErr) {
//         console.log("Error in INSERT query: ", insertErr);
//         return res.status(500).json("Internal Server Error");
//       }

//       // Handle successful insertion into assignassets table here
//       return res.status(200).json("Data moved successfully");
//     });
//   });
// }

//   });
// }

// // for tshirt

// if(req.body.assettype === 't-shirt'){
//   const sqlInsert = "INSERT INTO assignassets (name,vendername, designation, branch, assettype, brandname, issueddate, assetcode, anonymity, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
//   const valuesInsert = [req.body.name, req.body.designation, req.body.branch, req.body.assettype, req.body.brandname, req.body.issueddate, req.body.assetcode, req.body.anonymity, req.body.remarks];
//   // Query to fetch the quantity of the asset in the inventory table
//   const sqlSelect = "SELECT anonymity FROM inventory WHERE assettype = ?";
//   connection.query(sqlSelect, req.body.assettype, (selectErr, selectResult) => {
//     if (selectErr) {
//       console.log("Error in SELECT query: ", selectErr);
//       return res.status(500).json("Internal Server Error");
//     }

//     if (selectResult.length === 0) {
//       return res.status(404).json("Asset not found in the inventory");
//     }

//     const quantityInInventory = selectResult[0].anonymity || 0;

//     // If the quantity in the inventory is less than or equal to 0, return an error
//     if (quantityInInventory <= 0) {
//       return res.status(422).json("Insufficient quantity in the inventory");
//     }



// // Calculate the remaining quantity in the inventory after moving data to assignassets
// const remainingQuantity = quantityInInventory - req.body.anonymity;

// if (remainingQuantity <= 0) {
//   // If remaining quantity is 0 or less, delete the row from the inventory table
//   const sqlDelete = "DELETE FROM inventory WHERE assettype = ?";
//   connection.query(sqlDelete, [req.body.assettype], (deleteErr, deleteResult) => {
//     if (deleteErr) {
//       console.log("Error in DELETE query: ", deleteErr);
//       return res.status(500).json("Internal Server Error");
//     }

//     // Insert data into the assignassets table
//     connection.query(sqlInsert, valuesInsert, (insertErr, insertResult) => {
//       if (insertErr) {
//         console.log("Error in INSERT query: ", insertErr);
//         return res.status(500).json("Internal Server Error");
//       }

//       // Handle successful insertion into assignassets table here
//       return res.status(200).json("Data moved successfully");
//     });
//   });
// } else {
//   // Update the quantity in the inventory table
//   const sqlUpdate = "UPDATE inventory SET anonymity = ? WHERE assettype = ?";
//   connection.query(sqlUpdate, [remainingQuantity, req.body.assettype], (updateErr, updateResult) => {
//     if (updateErr) {
//       console.log("Error in UPDATE query: ", updateErr);
//       return res.status(500).json("Internal Server Error");
//     }

//     // Insert data into the assignassets table
//     connection.query(sqlInsert, valuesInsert, (insertErr, insertResult) => {
//       if (insertErr) {
//         console.log("Error in INSERT query: ", insertErr);
//         return res.status(500).json("Internal Server Error");
//       }

//       // Handle successful insertion into assignassets table here
//       return res.status(200).json("Data moved successfully");
//     });
//   });
// }   
//   });
// }


// // for charger

// if(req.body.assettype === 'charger'){
//   const sqlInsert = "INSERT INTO assignassets (name,vendername, designation, branch, assettype, brandname, issueddate, assetcode, anonymity, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
//   const valuesInsert = [req.body.name, req.body.vendername, req.body.designation, req.body.branch, req.body.assettype, req.body.brandname, req.body.issueddate, req.body.assetcode, req.body.anonymity, req.body.remarks];
//   // Query to fetch the quantity of the asset in the inventory table
//   const sqlSelect = "SELECT anonymity FROM inventory WHERE assettype = ?";
//   connection.query(sqlSelect, req.body.assettype, (selectErr, selectResult) => {
//     if (selectErr) {
//       console.log("Error in SELECT query: ", selectErr);
//       return res.status(500).json("Internal Server Error");
//     }

//     if (selectResult.length === 0) {
//       return res.status(404).json("Asset not found in the inventory");
//     }

//     const quantityInInventory = selectResult[0].anonymity || 0;

//     // If the quantity in the inventory is less than or equal to 0, return an error
//     if (quantityInInventory <= 0) {
//       return res.status(422).json("Insufficient quantity in the inventory");
//     }



// // Calculate the remaining quantity in the inventory after moving data to assignassets
// const remainingQuantity = quantityInInventory - req.body.anonymity;

// if (remainingQuantity <= 0) {
//   // If remaining quantity is 0 or less, delete the row from the inventory table
//   const sqlDelete = "DELETE FROM inventory WHERE assettype = ?";
//   connection.query(sqlDelete, [req.body.assettype], (deleteErr, deleteResult) => {
//     if (deleteErr) {
//       console.log("Error in DELETE query: ", deleteErr);
//       return res.status(500).json("Internal Server Error");
//     }

//     // Insert data into the assignassets table
//     connection.query(sqlInsert, valuesInsert, (insertErr, insertResult) => {
//       if (insertErr) {
//         console.log("Error in INSERT query: ", insertErr);
//         return res.status(500).json("Internal Server Error");
//       }

//       // Handle successful insertion into assignassets table here
//       return res.status(200).json("Data moved successfully");
//     });
//   });
// } else {
//   // Update the quantity in the inventory table
//   const sqlUpdate = "UPDATE inventory SET anonymity = ? WHERE assettype = ?";
//   connection.query(sqlUpdate, [remainingQuantity, req.body.assettype], (updateErr, updateResult) => {
//     if (updateErr) {
//       console.log("Error in UPDATE query: ", updateErr);
//       return res.status(500).json("Internal Server Error");
//     }

//     // Insert data into the assignassets table
//     connection.query(sqlInsert, valuesInsert, (insertErr, insertResult) => {
//       if (insertErr) {
//         console.log("Error in INSERT query: ", insertErr);
//         return res.status(500).json("Internal Server Error");
//       }

//       // Handle successful insertion into assignassets table here
//       return res.status(200).json("Data moved successfully");
//     });
//   });
// }  
//   });
// }

// // for mouse

// if(req.body.assettype === 'mouse'){
//   const sqlInsert = "INSERT INTO assignassets (name,vendername, designation, branch, assettype, brandname, issueddate, assetcode, anonymity, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
//   const valuesInsert = [req.body.name,req.body.vendername, req.body.designation, req.body.branch, req.body.assettype, req.body.brandname, req.body.issueddate, req.body.assetcode, req.body.anonymity, req.body.remarks];
//   // Query to fetch the quantity of the asset in the inventory table
//   const sqlSelect = "SELECT anonymity FROM inventory WHERE assettype = ?";
//   connection.query(sqlSelect, req.body.assettype, (selectErr, selectResult) => {
//     if (selectErr) {
//       console.log("Error in SELECT query: ", selectErr);
//       return res.status(500).json("Internal Server Error");
//     }

//     if (selectResult.length === 0) {
//       return res.status(404).json("Asset not found in the inventory");
//     }

//     const quantityInInventory = selectResult[0].anonymity || 0;

//     // If the quantity in the inventory is less than or equal to 0, return an error
//     if (quantityInInventory <= 0) {
//       return res.status(422).json("Insufficient quantity in the inventory");
//     }



// // Calculate the remaining quantity in the inventory after moving data to assignassets
// const remainingQuantity = quantityInInventory - req.body.anonymity;

// if (remainingQuantity <= 0) {
//   // If remaining quantity is 0 or less, delete the row from the inventory table
//   const sqlDelete = "DELETE FROM inventory WHERE assettype = ?";
//   connection.query(sqlDelete, [req.body.assettype], (deleteErr, deleteResult) => {
//     if (deleteErr) {
//       console.log("Error in DELETE query: ", deleteErr);
//       return res.status(500).json("Internal Server Error");
//     }

//     // Insert data into the assignassets table
//     connection.query(sqlInsert, valuesInsert, (insertErr, insertResult) => {
//       if (insertErr) {
//         console.log("Error in INSERT query: ", insertErr);
//         return res.status(500).json("Internal Server Error");
//       }

//       // Handle successful insertion into assignassets table here
//       return res.status(200).json("Data moved successfully");
//     });
//   });
// } else {
//   // Update the quantity in the inventory table
//   const sqlUpdate = "UPDATE inventory SET anonymity = ? WHERE assettype = ?";
//   connection.query(sqlUpdate, [remainingQuantity, req.body.assettype], (updateErr, updateResult) => {
//     if (updateErr) {
//       console.log("Error in UPDATE query: ", updateErr);
//       return res.status(500).json("Internal Server Error");
//     }

//     // Insert data into the assignassets table
//     connection.query(sqlInsert, valuesInsert, (insertErr, insertResult) => {
//       if (insertErr) {
//         console.log("Error in INSERT query: ", insertErr);
//         return res.status(500).json("Internal Server Error");
//       }

//       // Handle successful insertion into assignassets table here
//       return res.status(200).json("Data moved successfully");
//     });
//   });
// }  
//   });
// }

// // for 	student bags	

// if(req.body.assettype === 'student bags'){
//   const sqlInsert = "INSERT INTO assignassets (name,vendername, designation, branch, assettype, brandname, issueddate, assetcode, anonymity, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
//   const valuesInsert = [req.body.name,req.body.vendername, req.body.designation, req.body.branch, req.body.assettype, req.body.brandname, req.body.issueddate, req.body.assetcode, req.body.anonymity, req.body.remarks];
//   // Query to fetch the quantity of the asset in the inventory table
//   const sqlSelect = "SELECT anonymity FROM inventory WHERE assettype = ?";
//   connection.query(sqlSelect, req.body.assettype, (selectErr, selectResult) => {
//     if (selectErr) {
//       console.log("Error in SELECT query: ", selectErr);
//       return res.status(500).json("Internal Server Error");
//     }

//     if (selectResult.length === 0) {
//       return res.status(404).json("Asset not found in the inventory");
//     }

//     const quantityInInventory = selectResult[0].anonymity || 0;

//     // If the quantity in the inventory is less than or equal to 0, return an error
//     if (quantityInInventory <= 0) {
//       return res.status(422).json("Insufficient quantity in the inventory");
//     }



// // Calculate the remaining quantity in the inventory after moving data to assignassets
// const remainingQuantity = quantityInInventory - req.body.anonymity;

// if (remainingQuantity <= 0) {
//   // If remaining quantity is 0 or less, delete the row from the inventory table
//   const sqlDelete = "DELETE FROM inventory WHERE assettype = ?";
//   connection.query(sqlDelete, [req.body.assettype], (deleteErr, deleteResult) => {
//     if (deleteErr) {
//       console.log("Error in DELETE query: ", deleteErr);
//       return res.status(500).json("Internal Server Error");
//     }

//     // Insert data into the assignassets table
//     connection.query(sqlInsert, valuesInsert, (insertErr, insertResult) => {
//       if (insertErr) {
//         console.log("Error in INSERT query: ", insertErr);
//         return res.status(500).json("Internal Server Error");
//       }

//       // Handle successful insertion into assignassets table here
//       return res.status(200).json("Data moved successfully");
//     });
//   });
// } else {
//   // Update the quantity in the inventory table
//   const sqlUpdate = "UPDATE inventory SET anonymity = ? WHERE assettype = ?";
//   connection.query(sqlUpdate, [remainingQuantity, req.body.assettype], (updateErr, updateResult) => {
//     if (updateErr) {
//       console.log("Error in UPDATE query: ", updateErr);
//       return res.status(500).json("Internal Server Error");
//     }

//     // Insert data into the assignassets table
//     connection.query(sqlInsert, valuesInsert, (insertErr, insertResult) => {
//       if (insertErr) {
//         console.log("Error in INSERT query: ", insertErr);
//         return res.status(500).json("Internal Server Error");
//       }

//       // Handle successful insertion into assignassets table here
//       return res.status(200).json("Data moved successfully");
//     });
//   });
// }  
//   });
// }
// });




// // get userdata

// app.get("/getusers",(req,res)=>{

//   connection.query("SELECT * FROM inventory",(err,result)=>{
//       if(err){
//           res.status(422).json("nodata available");
//       }else{
//           res.status(201).json(result);
//       }
//   })
// });



// // user delete api

// app.delete("/deleteuser/:id",(req,res)=>{

//   const {id} = req.params;

//   connection.query("DELETE FROM inventory WHERE id = ? ",id,(err,result)=>{
//       if(err){
//           res.status(422).json("error");
//       }else{
//           res.status(201).json(result);
//       }
//   })
// });



// // get single user

// app.get("/induser/:id",(req,res)=>{

//   const {id} = req.params;

//   connection.query("SELECT * FROM inventory WHERE id = ? ",id,(err,result)=>{
//       if(err){
//           res.status(422).json("error");
//       }else{
//           res.status(201).json(result);
//       }
//   })
// });


// // update inventory api


// app.patch("/updateuser/:id",(req,res)=>{

//   const {id} = req.params;

//   const data = req.body;

//   connection.query("UPDATE inventory SET ? WHERE id = ? ",[data,id],(err,result)=>{
//       if(err){
//           res.status(422).json({message:"error"});
//       }else{
//           res.status(201).json(result);
//       }
//   })
// });



// // Endpoint for signup
// app.post('/signup', (req, res) => {
//   const sql = "INSERT INTO adminlogin (name, email, password) VALUES (?, ?, ?)";
//   const values = [req.body.name, req.body.email, req.body.password];

//   connection.query(sql, values, (err, data) => {
//     if (err) {
//       return res.json("Error");
//     }
//     return res.json(data);
//   });
// });

// // Endpoint for signin
// app.post('/signin', (req, res) => {
//   const sql = "SELECT * FROM adminlogin WHERE email = ? AND password = ?";
//   // const values = [req.body.name, req.body.email, req.body.password];

//   connection.query(sql, [req.body.email,req.body.password], (err, data) => {
//     if (err) {
//       return res.json("Error");
//     }
//     if(data.length > 0){
//       return res.json("success")
//     }else{
//       return res.json("faile");
//     }
    
//   });
// });

// // Connect to the database
// connection.connect((err) => {
//   if (err) {
//     console.error('Error connecting to MySQL:', err);
//     return;
//   }
//   console.log('Connected to MySQL database!');
// });

// inventory


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
const httpsPort = 3030;
httpsServer.listen(httpsPort, () => {
  console.log(`HTTPS server running on port ${httpsPort}`);
});

// app.listen(3030, () => {
//   console.log('server is running on 3030')
// })