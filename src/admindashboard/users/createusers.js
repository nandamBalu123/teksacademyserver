const express = require('express');
const app = express();
const http = require('http');
const https = require('https');
const connection = require('../../db/connection');
const axios = require('axios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')

app.use(cookieParser());


app.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({Status: "Success"});
})


app.post('/createUser', (req, res) => {
    var passwordd = req.body.email.split('@')[0];
    var passworddwithnum = passwordd;
    console.log(passworddwithnum);
    const sql = "INSERT INTO user (`fullname`, `email`, `password`, `phonenumber`, `designation`, `department`, `reportto`, `profile`, `branch`) VALUES (?)";
    bcrypt.hash(passwordd, 10, (err, hash) => {
        if (err) {
            console.error('Error in hashing password:', err);
            return res.json({ Error: 'Error in hashing password' });
        }
        const values = [
            req.body.fullname,
            req.body.email,
            hash,
            req.body.phonenum,
            req.body.designation,
            req.body.department,
            req.body.reportto,
            req.body.profile,
            req.body.branch,
        ];
        connection.query(sql, [values], (err, result) => {
            if (err) {
                console.error('Error in database query:', err);
                return res.json({ Status: "Error" });
            }
            console.log('User created successfully.');
            return res.json({ Status: "Success" });
        });
    });
});







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

            // Passwords match, user is authenticated
            // Generate JWT token
            const token = jwt.sign({ profile: "admin" }, jwtSecretKey, { expiresIn: '1d' });

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

                res.cookie('token', token);
                return res.status(200).json({ Status: "Success", AdminData: adminData });
            });
        });
    });
});


const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if(!token) {
        return res.json({Error: "You are no Authenticated"});
    } else {
        jwt.verify(token, "jwt-secret-key", (err, decoded) => {
            if(err) return res.json({Error: "Token wrong"});
            req.role = decoded.role;
            req.id = decoded.id;
            next();
        } )
    }
}
app.get('/dashboard',verifyUser, (req, res) => {
    return res.json({Status: "Success", role: req.role, id: req.id})
})


app.post('/employeelogin', (req, res) => {
    const sql = "SELECT * FROM employee Where email = ?";
    con.query(sql, [req.body.email], (err, result) => {
        if(err) return res.json({Status: "Error", Error: "Error in runnig query"});
        if(result.length > 0) {
            bcrypt.compare(req.body.password.toString(), result[0].password, (err, response)=> {
                if(err) return res.json({Error: "password error"});
                if(response) {
                    const token = jwt.sign({role: "employee", id: result[0].id}, "jwt-secret-key", {expiresIn: '1d'});
                    res.cookie('token', token);
                    return res.json({Status: "Success", id: result[0].id})
                } else {
                    return res.json({Status: "Error", Error: "Wrong Email or Password"});
                }
                
            })
            
        } else {
            return res.json({Status: "Error", Error: "Wrong Email or Password"});
        }
    })
})










// app.post('/adminlogin', (req, res) => {
//     const { email, password } = req.body;
//     const sql = "SELECT * FROM user WHERE email = ?";
    
//     console.log('Email from Request:', email);
//     console.log('Password from Request:', password);
  
//     // Ensure both variables are valid strings
//     const trimmedEmail = String(email).trim();
//     const trimmedPassword = String(password).trim();
    
//     connection.query(sql, [trimmedEmail], (err, result) => {
//         if (err) {
//             console.error('Error running database query:', err);
//             return res.status(500).json({ Status: "Error", Error: "Error in running query" });
//         }else{
//             res.status(200)
//         }

//         if (result.length > 0) {
//             const hashedPasswordFromDatabase = result[0].password;
            
//             console.log('Hashed Password from Database:', hashedPasswordFromDatabase);

//             // Compare the user-provided password with the hashed password from the database
//             bcrypt.compare(trimmedPassword, hashedPasswordFromDatabase, (bcryptErr, bcryptResult) => {
//                 console.log('bcryptErr:', bcryptErr);
//                 console.log('bcryptResult:', bcryptResult);

//                 if (bcryptErr || !bcryptResult) {
//                     console.log('Wrong Email or Password');
//                     return res.status(401).json({ Status: "Error", Error: "Wrong Email or Password" });
//                 }

//                 // Passwords match, user is authenticated
//                 // Generate JWT token
//                 const token = jwt.sign({ profile: "admin" }, jwtSecretKey, { expiresIn: '1d' });

//                 console.log('User logged in successfully. Token generated:', token);

//                 res.cookie('token', token);
//                 return res.json({ Status: "Success" });
//             });
//         } else {
//             console.log('User not found');
//             return res.status(401).json({ Status: "Error", Error: "User not found" });
//         }
//     });
// });
   


// app.post('/adminlogin', (req, res) => {
//     const sql = "SELECT * FROM user WHERE mail = ? AND password = ?";
//     console.log('Received POST request for admin login:', req.body);

//     connection.query(sql, [req.body.email, req.body.password], (err, result) => {
//         if (err) {
//             console.error('Error running database query:', err);
//             return res.json({ Status: "Error", Error: "Error in running query" });
//         }

//         console.log('Query result:', result);

//         if (result.length > 0) {
//             const id = result[0].id;
//             const token = jwt.sign({ profile: "admin" }, "jwt-secret-key", { expiresIn: '1d' });
//             res.cookie('token', token);

//             console.log('User logged in successfully. Token generated:', token);

//             return res.json({ Status: "Success" });
//         } else {
//             console.log('Wrong Email or Password');
//             return res.json({ Status: "Error", Error: "Wrong Email or Password" });
//         }
//     });
// });

module.exports = {
    usersCreation: app
}