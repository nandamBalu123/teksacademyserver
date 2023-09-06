const express = require('express');
const app = express();
const connection = require('../../db/connection');
const axios = require('axios');




// Endpoint for signup
app.post('/signup', (req, res) => {
    const sql = "INSERT INTO adminlogin (name, email, password) VALUES (?, ?, ?)";
    const values = [req.body.name, req.body.email, req.body.password];
  
    connection.query(sql, values, (err, data) => {
      if (err) {
        return res.json("Error");
      }
      return res.json(data);
    });
  });
  
  // Endpoint for signin
  app.post('/signin', (req, res) => {
    const sql = "SELECT * FROM adminlogin WHERE email = ? AND password = ?";
    // const values = [req.body.name, req.body.email, req.body.password];
  
    connection.query(sql, [req.body.email,req.body.password], (err, data) => {
      if (err) {
        return res.json("Error");
      }
      if(data.length > 0){
        return res.json("success")
      }else{
        return res.json("faile");
      }
      
    });
  });


  module.exports = {
    loginandregister: app
  }