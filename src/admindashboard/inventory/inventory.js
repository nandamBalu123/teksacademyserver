const express = require('express');
const app = express();
const http = require('http');
const https = require('https');
const connection = require('../../db/connection');
const axios = require('axios');



// inventory
app.post('/create', (req, res) => {
    const sql = "INSERT INTO inventory (name,vendername, designation, branch, assettype, brandname, issueddate, assetcode, anonymity,returndate, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?,?)";
    const values = [req.body.name, req.body.vendername, req.body.designation, req.body.branch, req.body.assettype, req.body.brandname, req.body.issueddate, req.body.assetcode, req.body.anonymity, req.body.remarks, req.body.returndate];
    
    if (!values.every(value => value !== undefined)) {
      return res.status(422).json("Please fill in all the data");
    }
  
    const selectQuery = "SELECT * FROM inventory WHERE designation = ?";
  //  selectResult
    connection.query(selectQuery, req.body.designation, (selectErr) => {
      if (selectErr) {
        console.log("Error in SELECT query: ", selectErr);
        return res.status(500).json("Internal Server Error");
      }
  
      // if (selectResult.length) {
      //   return res.status(422).json("This data already exists");
      // }
  
      connection.query(sql, values, (insertErr, insertResult) => {
        if (insertErr) {
          console.log("Error in INSERT query: ", insertErr);
          return res.status(500).json("Internal Server Error");
        }
  
        return res.status(201).json(req.body);
      });
    });
  });
  
  
  app.get("/getassets",(req,res)=>{
  
    connection.query("SELECT * FROM assignassets",(err,result)=>{
        if(err){
            res.status(422).json("nodata available");
        }else{
            res.status(201).json(result);
        }
    })
  });


  // addasset view in inventory component
  app.get("/addassetsview/:id",(req,res)=>{
  
    const {id} = req.params;
  
    connection.query("SELECT * FROM inventory WHERE id = ? ",id,(err,result)=>{
        if(err){
            res.status(422).json("error");
        }else{
            res.status(201).json(result);
        }
    })
  });
  


  app.get("/getaddassets/:id",(req,res)=>{
  
    const {id} = req.params;
  
    connection.query("SELECT * FROM inventory WHERE id = ? ",id,(err,result)=>{
        if(err){
            res.status(422).json("error");
        }else{
            res.status(201).json(result);
        }
    })
  });

  app.put('/updateaddassets', (req, res) => {
    const { name, vendername, designation, branch, assettype, brandname, issueddate, assetcode, anonymity, returndate, remarks, } = req.body;
  

    // Assuming your table is named 'users'
    const sql = 'UPDATE invenotry SET name, vendername, designation, branch, assettype, brandname, issueddate, assetcode, anonymity, returndate, remarks = ? WHERE your_condition_here';
  
    const values = [name, vendername, designation, branch, assettype, brandname, issueddate, assetcode, anonymity, returndate, remarks]
    connection.query(sql, values, (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      } else {
        const updatedRows = results.affectedRows;
  
        if (updatedRows > 0) {
          res.json({ updated: true });
        } else {
          res.json({ updated: false });
        }
      }
    });
  });




  app.delete("/addassetsdelete/:id",(req,res)=>{
  
    const {id} = req.params;
  
    connection.query("DELETE FROM inventory WHERE id = ? ",id,(err,result)=>{
        if(err){
            res.status(422).json("error");
        }else{
            res.status(201).json(result);
        }
    })
  });



  app.get("/viewassets/:id",(req,res)=>{
  
    const {id} = req.params;
  
    connection.query("SELECT * FROM assignassets WHERE id = ? ",id,(err,result)=>{
        if(err){
            res.status(422).json("error");
        }else{
            res.status(201).json(result);
        }
    })
  });
  

  
  app.patch("/updatassignassets/:id",(req,res)=>{
  
    const {id} = req.params;
  
    const data = req.body;
  
    connection.query("UPDATE assignassets SET ? WHERE id = ?",[data,id],(err,result)=>{
        if(err){
            res.status(422).json({message:"error"});
        }else{
          const { name,vendername, designation, branch, assettype, brandname, issueddate, assetcode, anonymity, remarks,returndate } = req.body;
  
          connection.beginTransaction((err) => {
            if (err) {
              // Handle error and rollback transaction if necessary
              res.status(422).json({ message: "error" });
              return;
            }
    
            // Step 1: Insert data into the inventory table
            connection.query("INSERT INTO inventory (name,vendername, designation, branch, assettype, brandname, issueddate, assetcode, anonymity, returndate, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)",
              [name, vendername, designation, branch, assettype, brandname, issueddate, assetcode, anonymity,returndate, remarks],
              (err, insertResult) => {
                if (err) {
                  // Step 2: Rollback the transaction if the INSERT operation fails
                  connection.rollback(() => {
                    res.status(422).json({ message: "error" });
                  });
                } else {
                  // Step 3: If the INSERT operation is successful, delete the data from assignassets
                  connection.query("DELETE FROM assignassets WHERE id = ?", [id], (err, deleteResult) => {
                    if (err) {
                      // Step 4: Rollback the transaction if the DELETE operation fails
                      connection.rollback(() => {
                        res.status(422).json({ message: "error" });
                      });
                    } else {
                      // Step 5: Commit the transaction if both INSERT and DELETE operations are successful
                      connection.commit((err) => {
                        if (err) {
                          // Handle error and rollback the transaction if necessary
                          connection.rollback(() => {
                            res.status(422).json({ message: "error" });
                          });
                        } else {
                          // Step 6: Respond with the successful result or any other response you want
                          res.status(201).json(insertResult);
                        }
                      });
                    }
                  });
                }
              }
            );
          });
  
        }
    })
  });
  
  app.delete("/deleteasset/:id",(req,res)=>{
  
    const {id} = req.params;
  
    connection.query("DELETE FROM assignassets WHERE id = ? ",id,(err,result)=>{
        if(err){
            res.status(422).json("error");
        }else{
            res.status(201).json(result);
        }
    })
  });
  
  
  app.post('/assignasset', (req, res) => {
    // const sqlInsert = "INSERT INTO assignassets (name, designation, branch, assettype, brandname, issueddate, assetcode, anonymity, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const valuesInsert = [req.body.name, req.body.vendername, req.body.designation, req.body.branch, req.body.assettype, req.body.brandname, req.body.issueddate, req.body.assetcode, req.body.anonymity, req.body.remarks];
    
    // if (!valuesInsert.every(value => value !== undefined)) {
    //   return res.status(422).json("Please fill in all the data");
    // }
  if(req.body.assettype == 'laptop'){
  
  
    const sqlInsert = "INSERT INTO assignassets (name,vendername, designation, branch, assettype, brandname, issueddate, assetcode, anonymity, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)";
    const valuesInsert = [req.body.name, req.body.vendername, req.body.designation, req.body.branch, req.body.assettype, req.body.brandname, req.body.issueddate, req.body.assetcode, req.body.anonymity, req.body.remarks];
    // Query to fetch the quantity of the asset in the inventory table
    const sqlSelect = "SELECT anonymity FROM inventory WHERE brandname = ?";
    connection.query(sqlSelect, req.body.brandname, (selectErr, selectResult) => {
      if (selectErr) {
        console.log("Error in SELECT query: ", selectErr);
        return res.status(500).json("Internal Server Error");
      }
  
      if (selectResult.length === 0) {
        return res.status(404).json("Asset not found in the inventory");
      }
  
      const quantityInInventory = selectResult[0].anonymity || 0;
  
      // If the quantity in the inventory is less than or equal to 0, return an error
      if (quantityInInventory <= 0) {
        return res.status(422).json("Insufficient quantity in the inventory");
      }
  
  
  
  // Calculate the remaining quantity in the inventory after moving data to assignassets
  const remainingQuantity = quantityInInventory - req.body.anonymity;
  
  if (remainingQuantity <= 0) {
    // If remaining quantity is 0 or less, delete the row from the inventory table
    const sqlDelete = "DELETE FROM inventory WHERE brandname = ? AND assetcode = ?";
    connection.query(sqlDelete, [req.body.brandname, req.body.assetcode], (deleteErr, deleteResult) => {
      if (deleteErr) {
        console.log("Error in DELETE query: ", deleteErr);
        return res.status(500).json("Internal Server Error");
      }
  
      // Insert data into the assignassets table
      connection.query(sqlInsert, valuesInsert, (insertErr, insertResult) => {
        if (insertErr) {
          console.log("Error in INSERT query: ", insertErr);
          return res.status(500).json("Internal Server Error");
        }
  
        // Handle successful insertion into assignassets table here
        return res.status(200).json("Data moved successfully");
      });
    });
  } else {
    // Update the quantity in the inventory table
    const sqlUpdate = "UPDATE inventory SET anonymity = ? WHERE brandname = ? AND assetcode = ?";
    connection.query(sqlUpdate, [remainingQuantity, req.body.brandname, req.body.assetcode], (updateErr, updateResult) => {
      if (updateErr) {
        console.log("Error in UPDATE query: ", updateErr);
        return res.status(500).json("Internal Server Error");
      }
  
      // Insert data into the assignassets table
      connection.query(sqlInsert, valuesInsert, (insertErr, insertResult) => {
        if (insertErr) {
          console.log("Error in INSERT query: ", insertErr);
          return res.status(500).json("Internal Server Error");
        }
  
        // Handle successful insertion into assignassets table here
        return res.status(200).json("Data moved successfully");
      });
    });
  }
  });
  
  
  }
  
  
  // for shirt
  
  if(req.body.assettype === 'shirt'){
    const sqlInsert = "INSERT INTO assignassets (name,vendername, designation, branch, assettype, brandname, issueddate, assetcode, anonymity, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const valuesInsert = [req.body.name, req.body.vendername, req.body.designation, req.body.branch, req.body.assettype, req.body.brandname, req.body.issueddate, req.body.assetcode, req.body.anonymity, req.body.remarks];
    // Query to fetch the quantity of the asset in the inventory table
    const sqlSelect = "SELECT anonymity FROM inventory WHERE assettype = ?";
    connection.query(sqlSelect, req.body.assettype, (selectErr, selectResult) => {
      if (selectErr) {
        console.log("Error in SELECT query: ", selectErr);
        return res.status(500).json("Internal Server Error");
      }
  
      if (selectResult.length === 0) {
        return res.status(404).json("Asset not found in the inventory");
      }
  
      const quantityInInventory = selectResult[0].anonymity || 0;
  
      // If the quantity in the inventory is less than or equal to 0, return an error
      if (quantityInInventory <= 0) {
        return res.status(422).json("Insufficient quantity in the inventory");
      }
  
  
  
  // Calculate the remaining quantity in the inventory after moving data to assignassets
  const remainingQuantity = quantityInInventory - req.body.anonymity;
  
  if (remainingQuantity <= 0) {
    // If remaining quantity is 0 or less, delete the row from the inventory table
    const sqlDelete = "DELETE FROM inventory WHERE assettype = ?";
    connection.query(sqlDelete, [req.body.assettype], (deleteErr, deleteResult) => {
      if (deleteErr) {
        console.log("Error in DELETE query: ", deleteErr);
        return res.status(500).json("Internal Server Error");
      }
  
      // Insert data into the assignassets table
      connection.query(sqlInsert, valuesInsert, (insertErr, insertResult) => {
        if (insertErr) {
          console.log("Error in INSERT query: ", insertErr);
          return res.status(500).json("Internal Server Error");
        }
  
        // Handle successful insertion into assignassets table here
        return res.status(200).json("Data moved successfully");
      });
    });
  } else {
    // Update the quantity in the inventory table
    const sqlUpdate = "UPDATE inventory SET anonymity = ? WHERE assettype = ?";
    connection.query(sqlUpdate, [remainingQuantity, req.body.assettype], (updateErr, updateResult) => {
      if (updateErr) {
        console.log("Error in UPDATE query: ", updateErr);
        return res.status(500).json("Internal Server Error");
      }
  
      // Insert data into the assignassets table
      connection.query(sqlInsert, valuesInsert, (insertErr, insertResult) => {
        if (insertErr) {
          console.log("Error in INSERT query: ", insertErr);
          return res.status(500).json("Internal Server Error");
        }
  
        // Handle successful insertion into assignassets table here
        return res.status(200).json("Data moved successfully");
      });
    });
  }
  
    });
  }
  
  // for tshirt
  
  if(req.body.assettype === 't-shirt'){
    const sqlInsert = "INSERT INTO assignassets (name,vendername, designation, branch, assettype, brandname, issueddate, assetcode, anonymity, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const valuesInsert = [req.body.name, req.body.vendername, req.body.designation, req.body.branch, req.body.assettype, req.body.brandname, req.body.issueddate, req.body.assetcode, req.body.anonymity, req.body.remarks];
    // Query to fetch the quantity of the asset in the inventory table
    const sqlSelect = "SELECT anonymity FROM inventory WHERE assettype = ?";
    connection.query(sqlSelect, req.body.assettype, (selectErr, selectResult) => {
      if (selectErr) {
        console.log("Error in SELECT query: ", selectErr);
        return res.status(500).json("Internal Server Error");
      }
  
      if (selectResult.length === 0) {
        return res.status(404).json("Asset not found in the inventory");
      }
  
      const quantityInInventory = selectResult[0].anonymity || 0;
  
      // If the quantity in the inventory is less than or equal to 0, return an error
      if (quantityInInventory <= 0) {
        return res.status(422).json("Insufficient quantity in the inventory");
      }
  
  
  
  // Calculate the remaining quantity in the inventory after moving data to assignassets
  const remainingQuantity = quantityInInventory - req.body.anonymity;
  
  if (remainingQuantity <= 0) {
    // If remaining quantity is 0 or less, delete the row from the inventory table
    const sqlDelete = "DELETE FROM inventory WHERE assettype = ?";
    connection.query(sqlDelete, [req.body.assettype], (deleteErr, deleteResult) => {
      if (deleteErr) {
        console.log("Error in DELETE query: ", deleteErr);
        return res.status(500).json("Internal Server Error");
      }
  
      // Insert data into the assignassets table
      connection.query(sqlInsert, valuesInsert, (insertErr, insertResult) => {
        if (insertErr) {
          console.log("Error in INSERT query: ", insertErr);
          return res.status(500).json("Internal Server Error");
        }
  
        // Handle successful insertion into assignassets table here
        return res.status(200).json("Data moved successfully");
      });
    });
  } else {
    // Update the quantity in the inventory table
    const sqlUpdate = "UPDATE inventory SET anonymity = ? WHERE assettype = ?";
    connection.query(sqlUpdate, [remainingQuantity, req.body.assettype], (updateErr, updateResult) => {
      if (updateErr) {
        console.log("Error in UPDATE query: ", updateErr);
        return res.status(500).json("Internal Server Error");
      }
  
      // Insert data into the assignassets table
      connection.query(sqlInsert, valuesInsert, (insertErr, insertResult) => {
        if (insertErr) {
          console.log("Error in INSERT query: ", insertErr);
          return res.status(500).json("Internal Server Error");
        }
  
        // Handle successful insertion into assignassets table here
        return res.status(200).json("Data moved successfully");
      });
    });
  }   
    });
  }
  
  
  // for charger
  
  if(req.body.assettype === 'charger'){
    const sqlInsert = "INSERT INTO assignassets (name,vendername, designation, branch, assettype, brandname, issueddate, assetcode, anonymity, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const valuesInsert = [req.body.name, req.body.vendername, req.body.designation, req.body.branch, req.body.assettype, req.body.brandname, req.body.issueddate, req.body.assetcode, req.body.anonymity, req.body.remarks];
    // Query to fetch the quantity of the asset in the inventory table
    const sqlSelect = "SELECT anonymity FROM inventory WHERE assettype = ?";
    connection.query(sqlSelect, req.body.assettype, (selectErr, selectResult) => {
      if (selectErr) {
        console.log("Error in SELECT query: ", selectErr);
        return res.status(500).json("Internal Server Error");
      }
  
      if (selectResult.length === 0) {
        return res.status(404).json("Asset not found in the inventory");
      }
  
      const quantityInInventory = selectResult[0].anonymity || 0;
  
      // If the quantity in the inventory is less than or equal to 0, return an error
      if (quantityInInventory <= 0) {
        return res.status(422).json("Insufficient quantity in the inventory");
      }
  
  
  
  // Calculate the remaining quantity in the inventory after moving data to assignassets
  const remainingQuantity = quantityInInventory - req.body.anonymity;
  
  if (remainingQuantity <= 0) {
    // If remaining quantity is 0 or less, delete the row from the inventory table
    const sqlDelete = "DELETE FROM inventory WHERE assettype = ?";
    connection.query(sqlDelete, [req.body.assettype], (deleteErr, deleteResult) => {
      if (deleteErr) {
        console.log("Error in DELETE query: ", deleteErr);
        return res.status(500).json("Internal Server Error");
      }
  
      // Insert data into the assignassets table
      connection.query(sqlInsert, valuesInsert, (insertErr, insertResult) => {
        if (insertErr) {
          console.log("Error in INSERT query: ", insertErr);
          return res.status(500).json("Internal Server Error");
        }
  
        // Handle successful insertion into assignassets table here
        return res.status(200).json("Data moved successfully");
      });
    });
  } else {
    // Update the quantity in the inventory table
    const sqlUpdate = "UPDATE inventory SET anonymity = ? WHERE assettype = ?";
    connection.query(sqlUpdate, [remainingQuantity, req.body.assettype], (updateErr, updateResult) => {
      if (updateErr) {
        console.log("Error in UPDATE query: ", updateErr);
        return res.status(500).json("Internal Server Error");
      }
  
      // Insert data into the assignassets table
      connection.query(sqlInsert, valuesInsert, (insertErr, insertResult) => {
        if (insertErr) {
          console.log("Error in INSERT query: ", insertErr);
          return res.status(500).json("Internal Server Error");
        }
  
        // Handle successful insertion into assignassets table here
        return res.status(200).json("Data moved successfully");
      });
    });
  }  
    });
  }
  
  // for mouse
  
  if(req.body.assettype === 'mouse'){
    const sqlInsert = "INSERT INTO assignassets (name,vendername, designation, branch, assettype, brandname, issueddate, assetcode, anonymity, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const valuesInsert = [req.body.name,req.body.vendername, req.body.designation, req.body.branch, req.body.assettype, req.body.brandname, req.body.issueddate, req.body.assetcode, req.body.anonymity, req.body.remarks];
    // Query to fetch the quantity of the asset in the inventory table
    const sqlSelect = "SELECT anonymity FROM inventory WHERE assettype = ?";
    connection.query(sqlSelect, req.body.assettype, (selectErr, selectResult) => {
      if (selectErr) {
        console.log("Error in SELECT query: ", selectErr);
        return res.status(500).json("Internal Server Error");
      }
  
      if (selectResult.length === 0) {
        return res.status(404).json("Asset not found in the inventory");
      }
  
      const quantityInInventory = selectResult[0].anonymity || 0;
  
      // If the quantity in the inventory is less than or equal to 0, return an error
      if (quantityInInventory <= 0) {
        return res.status(422).json("Insufficient quantity in the inventory");
      }
  
  
  
  // Calculate the remaining quantity in the inventory after moving data to assignassets
  const remainingQuantity = quantityInInventory - req.body.anonymity;
  
  if (remainingQuantity <= 0) {
    // If remaining quantity is 0 or less, delete the row from the inventory table
    const sqlDelete = "DELETE FROM inventory WHERE assettype = ?";
    connection.query(sqlDelete, [req.body.assettype], (deleteErr, deleteResult) => {
      if (deleteErr) {
        console.log("Error in DELETE query: ", deleteErr);
        return res.status(500).json("Internal Server Error");
      }
  
      // Insert data into the assignassets table
      connection.query(sqlInsert, valuesInsert, (insertErr, insertResult) => {
        if (insertErr) {
          console.log("Error in INSERT query: ", insertErr);
          return res.status(500).json("Internal Server Error");
        }
  
        // Handle successful insertion into assignassets table here
        return res.status(200).json("Data moved successfully");
      });
    });
  } else {
    // Update the quantity in the inventory table
    const sqlUpdate = "UPDATE inventory SET anonymity = ? WHERE assettype = ?";
    connection.query(sqlUpdate, [remainingQuantity, req.body.assettype], (updateErr, updateResult) => {
      if (updateErr) {
        console.log("Error in UPDATE query: ", updateErr);
        return res.status(500).json("Internal Server Error");
      }
  
      // Insert data into the assignassets table
      connection.query(sqlInsert, valuesInsert, (insertErr, insertResult) => {
        if (insertErr) {
          console.log("Error in INSERT query: ", insertErr);
          return res.status(500).json("Internal Server Error");
        }
  
        // Handle successful insertion into assignassets table here
        return res.status(200).json("Data moved successfully");
      });
    });
  }  
    });
  }
  
  // for 	student bags	
  
  if(req.body.assettype === 'student bags'){
    const sqlInsert = "INSERT INTO assignassets (name,vendername, designation, branch, assettype, brandname, issueddate, assetcode, anonymity, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const valuesInsert = [req.body.name,req.body.vendername, req.body.designation, req.body.branch, req.body.assettype, req.body.brandname, req.body.issueddate, req.body.assetcode, req.body.anonymity, req.body.remarks];
    // Query to fetch the quantity of the asset in the inventory table
    const sqlSelect = "SELECT anonymity FROM inventory WHERE assettype = ?";
    connection.query(sqlSelect, req.body.assettype, (selectErr, selectResult) => {
      if (selectErr) {
        console.log("Error in SELECT query: ", selectErr);
        return res.status(500).json("Internal Server Error");
      }
  
      if (selectResult.length === 0) {
        return res.status(404).json("Asset not found in the inventory");
      }
  
      const quantityInInventory = selectResult[0].anonymity || 0;
  
      // If the quantity in the inventory is less than or equal to 0, return an error
      if (quantityInInventory <= 0) {
        return res.status(422).json("Insufficient quantity in the inventory");
      }
  
  
  
  // Calculate the remaining quantity in the inventory after moving data to assignassets
  const remainingQuantity = quantityInInventory - req.body.anonymity;
  
  if (remainingQuantity <= 0) {
    // If remaining quantity is 0 or less, delete the row from the inventory table
    const sqlDelete = "DELETE FROM inventory WHERE assettype = ?";
    connection.query(sqlDelete, [req.body.assettype], (deleteErr, deleteResult) => {
      if (deleteErr) {
        console.log("Error in DELETE query: ", deleteErr);
        return res.status(500).json("Internal Server Error");
      }
  
      // Insert data into the assignassets table
      connection.query(sqlInsert, valuesInsert, (insertErr, insertResult) => {
        if (insertErr) {
          console.log("Error in INSERT query: ", insertErr);
          return res.status(500).json("Internal Server Error");
        }
  
        // Handle successful insertion into assignassets table here
        return res.status(200).json("Data moved successfully");
      });
    });
  } else {
    // Update the quantity in the inventory table
    const sqlUpdate = "UPDATE inventory SET anonymity = ? WHERE assettype = ?";
    connection.query(sqlUpdate, [remainingQuantity, req.body.assettype], (updateErr, updateResult) => {
      if (updateErr) {
        console.log("Error in UPDATE query: ", updateErr);
        return res.status(500).json("Internal Server Error");
      }
  
      // Insert data into the assignassets table
      connection.query(sqlInsert, valuesInsert, (insertErr, insertResult) => {
        if (insertErr) {
          console.log("Error in INSERT query: ", insertErr);
          return res.status(500).json("Internal Server Error");
        }
  
        // Handle successful insertion into assignassets table here
        return res.status(200).json("Data moved successfully");
      });
    });
  }  
    });
  }
  });
  
  
  
  
  // get userdata
  
  app.get("/getusers",(req,res)=>{

    connection.query("SELECT * FROM inventory",(err,result)=>{
        if(err){
            res.status(422).json("nodata available");
        }else{
            res.status(201).json(result);
        }
    })
  });
  
  
  
  // user delete api
  
  app.delete("/deleteuser/:id",(req,res)=>{
  
    const {id} = req.params;
  
    connection.query("DELETE FROM inventory WHERE id = ? ",id,(err,result)=>{
        if(err){
            res.status(422).json("error");
        }else{
            res.status(201).json(result);
        }
    })
  });
  
  
  
  // get single user
  
  app.get("/induser/:id",(req,res)=>{
  
    const {id} = req.params;
  
    connection.query("SELECT * FROM inventory WHERE id = ? ",id,(err,result)=>{
        if(err){
            res.status(422).json("error");
        }else{
            res.status(201).json(result);
        }
    })
  });
  
  
  // update inventory api
  
  
  app.patch("/updateuser/:id",(req,res)=>{
  
    const {id} = req.params;
  
    const data = req.body;
  
    connection.query("UPDATE inventory SET ? WHERE id = ? ",[data,id],(err,result)=>{
        if(err){
            res.status(422).json({message:"error"});
        }else{
            res.status(201).json(result);
        }
    })
  });

// settings
// assettype
app.put('/addvendorname', (req, res) => {
  
  const vendorName = req.body.venderName;

  // Assuming your table is named 'users'
  const sql = 'UPDATE inventory_settings SET vendorName = ? WHERE id = 1';

  const vendorNameJSON = JSON.stringify(vendorName)
  console.log(vendorNameJSON)
  connection.query(sql, [vendorNameJSON], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    } 
    // else {
    //   return res.status(200).json({ updated: true }); // Return a success response

    //   const updatedRows = results.affectedRows;

    //   if (updatedRows > 0) {
    //     res.json({ updated: true });
    //   } else {
    //     res.json({ updated: false });
    //   }
    // }
    
    return res.status(200).json({ updated: true }); // Return a success response
  });
});

// app.get("/getvendorname",(req,res)=>{
//   const sql = "SELECT * FROM inventory_settings";
  
//   connection.query(sql,(err,result)=>{
//       if(err){
//           res.status(422).json("nodata available");
//       }else{
//           res.status(201).json(result);
//       }
//   })
// });

app.get("/getvendorname", (req, res) => {
  const sql = "SELECT vendorName FROM inventory_settings WHERE id = 1"; // Assuming you want data for a specific ID, adjust as needed
  
  connection.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json("Internal Server Error");
    } else {
      if (result.length > 0) {
        const vendorNames = result.map(item => item.vendorName);
        res.status(200).json({ vendorNames });
      } else {
        res.status(404).json("Data not found");
      }
    }
  });
});



app.get('/getassettype', (req, res) => {
  
})

// export this file

module.exports = {
    inventorySystem: app
}