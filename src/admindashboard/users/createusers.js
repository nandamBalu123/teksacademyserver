const express = require('express');
const app = express();
const http = require('http');
const https = require('https');
const connection = require('../../db/connection');
const axios = require('axios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(cookieParser());


app.get('/logout', (req, res) => {
    
    res.clearCookie('token');
    return res.json({Status: "Success"});
    
})

app.post('/createuser', (req, res) => { 
  const email = req.body.email;
  const passwordd = email.split('@')[0];
  const passworddwithnum = passwordd;
  console.log(passworddwithnum);

  // Check if the email already exists in the database
  const checkEmailQuery = "SELECT COUNT(*) AS count FROM user WHERE email = ?";
  connection.query(checkEmailQuery, [email], (err, emailResult) => {
      if (err) {
          console.error('Error checking email in the database:', err);
          return res.json({ Status: "Error" });
      }
      
      // Check if the email count is greater than 0, indicating that the email already exists
      if (emailResult[0].count > 0) {
          console.log('Email already exists.');
          // return res.json({ Status: "Email already exists" });
          return res.json({ Status: 'exists'})
          
      }

      // If the email is not found, proceed with user creation
      bcrypt.hash(passwordd, 10, (hashErr, hash) => {
          if (hashErr) {
              console.error('Error in hashing password:', hashErr);
              return res.json({ Error: 'Error in hashing password' });
          }

          const insertUserQuery = "INSERT INTO user (`fullname`, `email`, `password`, `phonenumber`, `designation`, `department`, `reportto`, `profile`, `branch`) VALUES (?)";
          const values = [
              req.body.fullname,
              email,
              hash,
              req.body.phonenum,
              req.body.designation,
              req.body.department,
              req.body.reportto,
              req.body.profile,
              req.body.branch,
          ];

          connection.query(insertUserQuery, [values], (insertErr, result) => {
              if (insertErr) {
                  console.error('Error in database query:', insertErr);
                  return res.json({ Status: "Error" });
              }
              console.log('User created successfully.');
              return res.json({ Status: "Success" });
          });
      });
  });
});


// app.post('/createuser', (req, res) => { 
//     var passwordd = req.body.email.split('@')[0];
//     var passworddwithnum = passwordd;
//     console.log(passworddwithnum);
//     const sql = "INSERT INTO user (`fullname`, `email`, `password`, `phonenumber`, `designation`, `department`, `reportto`, `profile`, `branch`) VALUES (?)";
//     bcrypt.hash(passwordd, 10, (err, hash) => {
//         if (err) {
//             console.error('Error in hashing password:', err);
//             return res.json({ Error: 'Error in hashing password' });
//         }
//         const values = [
//             req.body.fullname,
//             req.body.email,
//             hash,
//             req.body.phonenum,
//             req.body.designation,
//             req.body.department,
//             req.body.reportto,
//             req.body.profile,
//             req.body.branch,
//         ];
//         connection.query(sql, [values], (err, result) => {
//             if (err) {
//                 console.error('Error in database query:', err);
//                 return res.json({ Status: "Error" });
//             }
//             console.log('User created successfully.');
//             return res.json({ Status: "Success" });
//         });
//     });
// });



app.get('/userdata', (req, res) => {
    const sql = "SELECT * FROM user";
    connection.query(sql, (err, result) => {
        if(err) return res.json({Error: "Get employee error in sql"});
        return res.json({Status: "Success", Result: result})
    })
})

// Secret key for JWT (store this securely and use environment variables)
const jwtSecretKey = 'your_secret_key';
app.post('/adminlogin', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM user WHERE email = ?";

    console.log('Email from Request:', email);
    console.log('Password from Request:', password);

    // Ensure both variables are valid strings
    const trimmedEmail = String(email).trim();
    const trimmedPassword = String(password).trim();

    connection.query(sql, [trimmedEmail], (err, result) => {
        if (err) {
            console.error('Error running database query:', err);
            return res.status(500).json({ Status: "Error", Error: "Error in running query" });
        }

        if (result.length === 0) {
            console.log('User not found');
            return res.status(401).json({ Status: "Error", Error: "User not found" });
        }

        const hashedPasswordFromDatabase = result[0].password;

        // Compare the user-provided password with the hashed password from the database
        bcrypt.compare(trimmedPassword, hashedPasswordFromDatabase, (bcryptErr, bcryptResult) => {
            console.log('bcryptErr:', bcryptErr);
            console.log('bcryptResult:', bcryptResult);

            if (bcryptErr || !bcryptResult) {
                console.log('Wrong Email or Password');
                return res.status(401).json({ Status: "Error", Error: "Wrong Email or Password" });
            }

            const token = jwt.sign({ profile: "admin" }, jwtSecretKey, { expiresIn: '1d' });
            res.cookie('token', token);
            console.log('User logged in successfully. Token generated:', token);

            // Fetch admin-specific data from the database here
            // You can execute another query to retrieve data specific to admin users
            // For example:
            const adminDataSql = "SELECT * FROM user WHERE id = ?";
            const adminId = result[0].id;

            connection.query(adminDataSql, [adminId], (adminErr, adminResult) => {
                if (adminErr) {
                    console.error('Error fetching admin data:', adminErr);
                    return res.status(500).json({ Status: "Error", Error: "Error fetching admin data" });
                }
                // Assuming admin data is successfully fetched, you can include it in the response
                const adminData = adminResult[0];

                // res.cookie('token', token, { httpOnly: false });
                res.cookie('token', token);
                return res.status(200).json({ Status: "Success", adminData: adminData, token: token });

                // res.cookie('token', token);
                // return res.status(200).json({ Status: "Success", AdminData: adminData });
            });
        });
    });
});


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
        })
    }
}
app.get('/dashboard', verifyUser, (req, res) => {
    return res.json({ Status: "Success", role: req.role, id: req.id })
})



app.post('/employeelogin', (req, res) => {
    const sql = "SELECT * FROM user Where email = ?";
    connection.query(sql, [req.body.email], (err, result) => {
        if(err) return res.json({Status: "Error", Error: "Error in runnig query"});
        if(result.length > 0) {
            bcrypt.compare(req.body.password.toString(), result[0].password, (err, response)=> {
                if(err) return res.json({Error: "password error"});
                if(response) {
                    const token = jwt.sign({profile: "admin", id: result[0].id}, "jwt-secret-key", {expiresIn: '1d'});
                    res.cookie('token', token);
                    return res.json({Status: "Success", id: result[0].id})
                } else {
                    return res.json({Status: "Error", Error: "Wrong Email or Password"});
                }
                
            })
            
        } else {
            console.log("wrong email")
            return res.json({Status: "Error", Error: "Wrong Email or Password"});
            
        }
    })
})


app.post('/userroles', (req, res) => {
    const sql = "INSERT INTO roles_permissions (role,description) VALUES (?, ?)";
    const values = [req.body.role, req.body.description];
    
    if (!values.every(value => value !== undefined)) {
      return res.status(422).json("Please fill in all the data");
    }
  
  //  selectResult
    
      connection.query(sql, values, (insertErr, insertResult) => {
        if (insertErr) {
          console.log("Error in INSERT query: ", insertErr);
          return res.status(500).json("Internal Server Error");
        }
  
        return res.status(201).json(req.body);
      });
    
})


app.get('/getuserroles', (req, res) => {
    const sql = "SELECT * FROM roles_permissions";
    connection.query(sql, (err, result) => {
        if(err) return res.json({Error: "Get userroles error in sql"});
        return res.json({Status: "Success", Result: result})
    })
})

app.get("/viewuser/:id",(req,res)=>{
  
    const {id} = req.params;
  
    connection.query("SELECT * FROM user WHERE id = ? ",id,(err,result)=>{
        if(err){
            res.status(422).json("error");
        }else{
            res.status(201).json(result);
        }
    })
  });


  
  // Delete a user by ID
app.delete('/deleteuser/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM user WHERE id = ?';
console.log(sql);
  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting user:', err);
      res.status(500).send('Internal Server Error'); // You can customize the error response as needed
    } else {
      console.log('User deleted successfully');
      res.send('User deleted successfully');
    }
  });
});

  
    // connection.query("DELETE FROM user WHERE id = ?", id, (err, result) => {
    //   if (err) {
    //     console.error("Error deleting user:", err);
    //     res.status(500).json({ error: "Internal Server Error" });
    //   } else {
    //     if (result.affectedRows === 0) {
    //       // User with the given ID was not found
    //       res.status(404).json({ error: "User not found" });
    //     } else {
    //       // User deleted successfully
    //       res.status(200).json({ message: "User deleted successfully" });
    //     }
    //   }
    // });

  
  app.put('/updateuser/:id', (req, res) => {
    const sql = "UPDATE user SET fullname = ?, email = ?, phonenumber = ?, designation = ?, department = ?, reportto = ?, profile = ?, branch = ? WHERE id = ?;";
    const id = req.params.id;
    const { fullname, email, phonenumber, designation, department, reportto, profile, branch } = req.body; // Destructure the request body
  
    connection.query(sql, [fullname, email, phonenumber, designation, department, reportto, profile, branch, id], (err, result) => {
      if (err) {
        console.error('Error updating user:', err);
        return res.status(500).json({ error: "Internal Server Error" }); // Return an error response
      }
      return res.status(200).json({ updated: true }); // Return a success response
    });
  });


  
  

// student management


app.post('/student_form', (req, res) => {
    // SQL query with placeholders
    const sql = `
      INSERT INTO student_details (
        name, email, mobilenumber, parentsname, birthdate, gender, maritalstatus,
        college, country, state, area, native, zipcode, whatsappno, educationtype, marks,
        academicyear, profilepic, enquirydate, enquirytakenby, coursepackage, courses, 
        leadsource, branch, modeoftraining, admissionstatus, registrationnumber, 
        admissiondate, validitystartdate, validityenddate, feedetails, grosstotal,
        totaldiscount, totaltax, grandtotal, admissionremarks, assets, totalinstallments,
        dueamount, addfee, initialamount, duedatetype, installments, materialfee, coursefee,
        admissionfee
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  
    // Convert the feedetails array to JSON

    const feedetails = req.body.feedetails;
    const installments = req.body.initialamount;
    
    const feedetailsJSON = JSON.stringify(feedetails);
    const installmentsJSON = JSON.stringify(installments)
    
  
    const values = [
      req.body.name, req.body.email, req.body.mobileNumber, req.body.parentsname, req.body.birthdate,
      req.body.gender, req.body.maritalStatus, req.body.college, req.body.country, req.body.state,
      req.body.area, req.body.native, req.body.zipcode, req.body.whatsAppNo, req.body.educationType,
      req.body.marks, req.body.academicyear, req.body.profilepic, req.body.enquiryDate,
      req.body.enquiryTakenBy, req.body.coursePackage, req.body.courses, req.body.leadSource,
      req.body.branch, req.body.modeOfTraining, req.body.admissionStatus, req.body.registrationNumber,
      req.body.admissionDate, req.body.validityStartDate, req.body.validityEndDate, feedetailsJSON, req.body.grosstotal,
      req.body.totaldiscount, req.body.totaltax, req.body.grandtotal, req.body.admissionremarks, req.body.assets,
      req.body.totalinstallments, req.body.dueamount, req.body.addfee, installmentsJSON,req.body.duedatetype,
      req.body.duedatetype, req.body.installments, req.body.materialfee, req.body.coursefee, req.body.admissionfee
    ];
  
    // Execute the SQL query
    connection.query(sql, values, (insertErr, insertResult) => {
      if (insertErr) {
        console.error('Error in INSERT query:', insertErr);
        return res.status(500).json('Internal Server Error');
      }
  
      // Insertion successful, you can return a success response
      return res.status(201).json('Student details inserted successfully');
    });
  });

  
  
  app.get('/getstudent_data', (req, res) => {
    connection.query("SELECT * FROM student_details",(err,result)=>{
        if(err){
            res.status(422).json("nodata available");
        }else{
            res.status(201).json(result);
        }
    })

    app.get("/viewstudentdata/:id",(req,res)=>{
  
        const {id} = req.params;
      
        connection.query("SELECT * FROM student_details WHERE id = ? ",id,(err,result)=>{
            if(err){
                res.status(422).json("error");
            }else{
                res.status(201).json(result);
            }
        })
      });
    
  });
  

  app.put('/updatestudentdata/:id', (req, res) => {
    const sql = `UPDATE student_details SET name=?, email=?, mobilenumber=?, parentsname=?,
    birthdate=?, gender=?, maritalstatus=?, college=?, country=?, state=?, area=?, native=?, 
    zipcode=?, whatsappno=?, educationtype=?, marks=?, academicyear=?, profilepic=?, 
    enquirydate=?, enquirytakenby=?, coursepackage=?, courses=?, leadsource=?, branch=?, 
    modeoftraining=?, admissionstatus=?, registrationnumber=?, admissiondate=?, validitystartdate=?,
     validityenddate=?, feedetails=?, grosstotal=?, totaldiscount=?, totaltax=?, grandtotal=?, 
     admissionremarks=?, assets=? WHERE id=?`;
    const id = req.params.id;
    const { name, email, mobilenumber, parentsname, birthdate, gender, maritalstatus, college,
       country, state, area, native, zipcode, whatsappno, educationtype, marks, academicyear, 
       profilepic, enquirydate, enquirytakenby, coursepackage, courses, leadsource, branch, 
       modeoftraining, admissionstatus, registrationnumber, admissiondate, validitystartdate, 
       validityenddate, feedetails, grosstotal, totaldiscount, totaltax, grandtotal, admissionremarks, 
       assets} = req.body; // Destructure the request body
  
    connection.query(sql, [name, email, mobilenumber, parentsname, birthdate, gender, maritalstatus,
       college, country, state, area, native, zipcode, whatsappno, educationtype, marks, academicyear,
        profilepic, enquirydate, enquirytakenby, coursepackage, courses, leadsource, branch, 
        modeoftraining, admissionstatus, registrationnumber, admissiondate, validitystartdate,
         validityenddate, feedetails, grosstotal, totaldiscount, totaltax, grandtotal, 
         admissionremarks, assets, id], (err, result) => {
      if (err) {
        console.error('Error updating student data:', err);
        return res.status(500).json({ error: "Internal Server Error" }); // Return an error response
      }
      return res.status(200).json({ updated: true }); // Return a success response
    });
  });
  
  

module.exports = {
    usersCreation: app
}