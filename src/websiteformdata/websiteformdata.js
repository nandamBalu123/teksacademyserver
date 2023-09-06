const express = require('express');
const app = express.Router();
const http = require('http');
const https = require('https');
const bodyParser = require('body-parser');
const axios = require('axios');
const mailgun = require('mailgun-js');
const tls = require('tls');
const connection = require('../db/connection');


app.post('/form-data', (req, res) => {
    const { dname, demail, dphone, dcity } = req.body;
  
    if (!dname || !demail || !dphone || !dcity) {
      console.error('Please fill in all required fields');
      return res.status(400).send('Please fill in all required fields');
    }
  
    const kylasapiData = {
      firstName: dname,
      lastName: '',
      phoneNumbers: [
        {
          type: 'MOBILE',
          code: 'IN',
          value: dphone,
          dialCode: '91',
          primary: true,
        },
      ],
      emails: [
        {
          type: 'OFFICE',
          value: demail,
          primary: true,
        },
      ],
      customFieldValues: {
        city: dcity,
      },
      source: 1056041,
    };
  
    axios
      .post('https://api.kylas.io/v1/leads/', kylasapiData, {
        headers: {
          'api-key': '944d1a61-c3cb-454b-96cc-018894f679c8:7549', // API KEY Here
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      .then(() => {
        const successMessage = `Thank you for your submission, ${dname}! We will contact you at ${dphone} or ${demail} regarding the ${dcity} course.`;
        res.status(200).send(successMessage);
      })
      .catch((error) => {
        console.error('Error submitting form data:', error);
        res.status(500).send('There was an error submitting your form. Please try again later.');
      })
      .finally(() => {
        // Save the form data to MySQL
        const query = 'INSERT INTO formdata (name, email, phone, city) VALUES (?, ?, ?, ?)';
        const values = [dname, demail, dphone, dcity];
  
        connection.query(query, values, (err, result) => {
          if (err) {
            console.error('Error saving form data to MySQL:', err);
            return res.status(500).send('Internal Server Error');
          }
      // Send form data as an email using Mailgun
          const mg = mailgun({
            apiKey: '864d92ccca4a4fb6d86873f898ab23f4-6d8d428c-d5579fe9', // Replace with your Mailgun API key
            domain: 'sandbox2636d284a2034591af3a83bed7cf00c9.mailgun.org', // Replace with your Mailgun domain
          });
  
          const data = {
            from: demail,
            to: 'digitalmarketing@kapilguru.com',
            subject: 'This e-mail was sent from Download Syllabus page',
            text: `Name: ${dname}\nEmail: ${demail}\nPhone: ${dphone}\nCity: ${dcity}\nThis e-mail was sent from Download Syllabus page`,
          };
  
          mg.messages().send(data, (error, body) => {
            if (error) {
              console.error('Error sending email:', error);
            } else {
              console.log('Email sent:', body);
            }
          });
          
        });
      });
  });
  
  // whats app
  app.post('/whatsapp-formData', (req, res) => {
        
    const { wname, wemail, wphone, wcourse } = req.body;
  
    if (!wname || !wemail || !wphone || !wcourse) {
      console.error('Please fill in all required fields');
      return res.status(400).send('Please fill in all required fields');
    }
  
    const kylasapiData = {
      firstName: wname,
      lastName: '',
      phoneNumbers: [
        {
          type: 'MOBILE',
          code: 'IN',
          value: wphone,
          dialCode: '91',
          primary: true,
        },
      ],
      emails: [
        {
          type: 'OFFICE',
          value: wemail,
          primary: true,
        },
      ],
      customFieldValues: {
        cfEnquiredCourse: wcourse,
      },
      source: 1056043,
    };
  
    axios
      .post('https://api.kylas.io/v1/leads/', kylasapiData, {
        headers: {
          'api-key': '944d1a61-c3cb-454b-96cc-018894f679c8:7549', // API KEY Here
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      .then(() => {
        const successMessage = `Thank you for your submission, ${wname}! We will contact you at ${wphone} or ${wemail} regarding the ${wcourse} course.`;
        res.status(200).send(successMessage);
      })
      .catch((error) => {
        console.error('Error submitting form data:', error);
        res.status(500).send('There was an error submitting your form. Please try again later.');
      })
      .finally(() => {
        // Save the form data to MySQL
        const query = 'INSERT INTO whatsappFromData (name, email, phone, course) VALUES (?, ?, ?, ?)';
        const values = [wname, wemail, wphone, wcourse];
  
        connection.query(query, values, (err, result) => {
          if (err) {
            console.error('Error saving form data to MySQL:', err);
            return res.status(500).send('Internal Server Error');
          }
  
          // Send form data as an email using Mailgun
          const mg = mailgun({
            apiKey: '864d92ccca4a4fb6d86873f898ab23f4-6d8d428c-d5579fe9', // Replace with your Mailgun API key
            domain: 'sandbox2636d284a2034591af3a83bed7cf00c9.mailgun.org', // Replace with your Mailgun domain
          });
  
          const data = {
            from: wemail,
            to: 'digitalmarketing@kapilguru.com',
            subject: 'This e-mail was sent from Whats App page',
            text: `Name: ${wname}\nEmail: ${wemail}\nPhone: ${wphone}\nCity: ${wcourse}\nThis e-mail was sent from Whats App page`,
          };
  
          mg.messages().send(data, (error, body) => {
            if (error) {
              console.error('Error sending email:', error);
            } else {
              console.log('Email sent:', body);
            }
          });
          
        });
      });
  });
  
  // single overview page side form data
  app.post('/scform-data', (req, res) => {
    const { scname, scemail, sccontactnumber, sccourse } = req.body;
  if (!scname || !scemail || !sccontactnumber || !sccourse) {
      console.error('Please fill in all required fields');
      return res.status(400).send('Please fill in all required fields');
    }
  
    const kylasapiData = {
      firstName: scname,
      lastName: '',
      phoneNumbers: [
        {
          type: 'MOBILE',
          code: 'IN',
          value: sccontactnumber,
          dialCode: '91',
          primary: true,
        },
      ],
      emails: [
        {
          type: 'OFFICE',
          value: scemail,
          primary: true,
        },
      ],
      customFieldValues: {
        cfEnquiredCourse: sccourse,
      },
      source: 1056041,
    };
  
    axios
      .post('https://api.kylas.io/v1/leads/', kylasapiData, {
        headers: {
          'api-key': '944d1a61-c3cb-454b-96cc-018894f679c8:7549', // API KEY Here
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      .then(() => {
        const successMessage = `Thank you for your submission, ${scname}! We will contact you at ${sccontactnumber} or ${scemail} regarding the ${sccourse} course.`;
        res.status(200).send(successMessage);
        res.redirect('https://teksacademy.com/thank-you');
      })
      .catch((error) => {
        console.error('Error submitting form data:', error);
        res.status(500).send('There was an error submitting your form. Please try again later.');
      })
      .finally(() => {
        // Save the form data to MySQL
        const query = 'INSERT INTO scformdata (name, email, phone, course) VALUES (?, ?, ?, ?)';
        const values = [scname, scemail, sccontactnumber, sccourse];
  
        connection.query(query, values, (err, result) => {
          if (err) {
            console.error('Error saving form data to MySQL:', err);
            return res.status(500).send('Internal Server Error');
          }
  
          // Send form data as an email using Mailgun
          const mg = mailgun({
            apiKey: '864d92ccca4a4fb6d86873f898ab23f4-6d8d428c-d5579fe9', // Replace with your Mailgun API key
            domain: 'sandbox2636d284a2034591af3a83bed7cf00c9.mailgun.org', // Replace with your Mailgun domain
          });
  
          const data = {
            from: scemail,
            to: 'digitalmarketing@kapilguru.com',
            subject: 'This e-mail was sent from single course page side form',
            text: `Name: ${scname}\nEmail: ${scemail}\nPhone: ${sccontactnumber}\nCity: ${sccourse}\nThis e-mail was sent from single course page side form`,
          };
  
          mg.messages().send(data, (error, body) => {
            if (error) {
              console.error('Error sending email:', error);
            } else {
              console.log('Email sent:', body);
            }
          });
          
        });
      });
  });
  
  app.post('/slpform-data', (req, res) => {
    const { slpname, slpemail, slpcontactnumber, slpcourse } = req.body;
  if (!slpname || !slpemail || !slpcontactnumber || !slpcourse) {
      console.error('Please fill in all required fields');
      return res.status(400).send('Please fill in all required fields');
    }
  
    const kylasapiData = {
      firstName: slpname,
      lastName: '',
      phoneNumbers: [
        {
          type: 'MOBILE',
          code: 'IN',
          value: slpcontactnumber,
          dialCode: '91',
          primary: true,
        },
      ],
      emails: [
        {
          type: 'OFFICE',
          value: slpemail,
          primary: true,
        },
      ],
      customFieldValues: {
        cfEnquiredCourse: slpcourse,
      },
      source: 1056041,
    };
  
    axios
      .post('https://api.kylas.io/v1/leads/', kylasapiData, {
        headers: {
          'api-key': '944d1a61-c3cb-454b-96cc-018894f679c8:7549', // API KEY Here
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      .then(() => {
        const successMessage = `Thank you for your submission, ${slpname}! We will contact you at ${slpcontactnumber} or ${slpemail} regarding the ${slpcourse} course.`;
        res.status(200).send(successMessage);
        res.redirect('https://teksacademy.com/thank-you');
      })
      .catch((error) => {
        console.error('Error submitting form data:', error);
        res.status(500).send('There was an error submitting your form. Please try again later.');
      })
      .finally(() => {
        // Save the form data to MySQL
        const query = 'INSERT INTO slpform (name, email, phone, course, city) VALUES (?, ?, ?, ?)';
        const values = [slpname, slpemail, slpcontactnumber, slpcourse, slpcity];
  
        connection.query(query, values, (err, result) => {
          if (err) {
            console.error('Error saving form data to MySQL:', err);
            return res.status(500).send('Internal Server Error');
          }
  
          // Send form data as an email using Mailgun
          const mg = mailgun({
            apiKey: '864d92ccca4a4fb6d86873f898ab23f4-6d8d428c-d5579fe9', // Replace with your Mailgun API key
            domain: 'sandbox2636d284a2034591af3a83bed7cf00c9.mailgun.org', // Replace with your Mailgun domain
          });
  
          const data = {
            from: slpemail,
            to: 'digitalmarketing@kapilguru.com',
            subject: 'This mail came from SLP single page form',
            text: `Name: ${slpname}\nEmail: ${slpemail}\nPhone: ${slpcontactnumber}\nCity: ${slpcity}\nThis mail came from SLP single page form`,
          };
  
          mg.messages().send(data, (error, body) => {
            if (error) {
              console.error('Error sending email:', error);
            } else {
              console.log('Email sent:', body);
            }
          });
          
        });
      });
  });
  
  // contact us page form data
  app.post('/contactpage-form-data', (req, res) => {
    const { name, email, number, course, city } = req.body;
  if (!name || !email || !number || !course || !city) {
      console.error('Please fill in all required fields');
      return res.status(400).send('Please fill in all required fields');
    }
  
    const kylasapiData = {
      firstName: name,
      lastName: '',
      phoneNumbers: [
        {
          type: 'MOBILE',
          code: 'IN',
          value: number,
          dialCode: '91',
          primary: true,
        },
      ],
      emails: [
        {
          type: 'OFFICE',
          value: email,
          primary: true,
        },
      ],
      customFieldValues: {
        cfEnquiredCourse: course,
        city: city,
      },
      source: 1056041,
    };
  
    axios
      .post('https://api.kylas.io/v1/leads/', kylasapiData, {
        headers: {
          'api-key': '944d1a61-c3cb-454b-96cc-018894f679c8:7549', // API KEY Here
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      .then(() => {
        const successMessage = `Thank you for your submission, ${name}! We will contact you at ${number} or ${email} regarding the ${course} course.`;
        res.status(200).send(successMessage);
      
      })
      .catch((error) => {
        console.error('Error submitting form data:', error);
        res.status(500).send('There was an error submitting your form. Please try again later.');
      })
      .finally(() => {
        // Save the form data to MySQL
        const query = 'INSERT INTO contactusform (name, email, phone, course, city, date) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [name, email, number, course, city];
  
        connection.query(query, values, (err, result) => {
          if (err) {
            console.error('Error saving form data to MySQL:', err);
            return res.status(500).send('Internal Server Error');
          }
  
          // Send form data as an email using Mailgun
          const mg = mailgun({
            apiKey: '864d92ccca4a4fb6d86873f898ab23f4-6d8d428c-d5579fe9', // Replace with your Mailgun API key
            domain: 'sandbox2636d284a2034591af3a83bed7cf00c9.mailgun.org', // Replace with your Mailgun domain
          });
  
          const data = {
            from: email,
            to: 'digitalmarketing@kapilguru.com',
            subject: 'This e-mail was sent from contact page',
            text: `Name: ${name}\nEmail: ${email}\nPhone: ${number}\nCourse: ${course}\nCity: ${city}\nThis e-mail was sent from contact page`,
          };
  
          mg.messages().send(data, (error, body) => {
            if (error) {
              console.error('Error sending email:', error);
            } else {
              console.log('Email sent:', body);
            }
          });
          
        });
      });
    
  });
  
  // enquiry form data
  app.post('/enquiry-form-data', (req, res) => {
    const { efname, efemail, efphone, efcourse, efcity } = req.body;
  if (!efname || !efemail || !efphone || !efcourse || !efcity) {
      console.error('Please fill in all required field');
      return res.status(400).send('Please fill in all required fields');
    }
  
    const kylasapiData = {
      firstName: efname,
      lastName: '',
      phoneNumbers: [
        {
          type: 'MOBILE',
          code: 'IN',
          value: efphone,
          dialCode: '91',
          primary: true,
        },
      ],
      emails: [
        {
          type: 'OFFICE',
          value: efemail,
          primary: true,
        },
      ],
      customFieldValues: {
        cfEnquiredCourse: efcourse,
        city: efcity,
      },
      source: 1056041,
    };
  
    axios
      .post('https://api.kylas.io/v1/leads/', kylasapiData, {
        headers: {
          'api-key': '944d1a61-c3cb-454b-96cc-018894f679c8:7549', // API KEY Here
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      .then(() => {
        const successMessage = `Thank you for your submission, ${efname}! We will contact you at ${efphone} or ${efemail} regarding the ${efcourse} course.`;
        res.status(200).send(successMessage);
      })
      .catch((error) => {
        console.error('Error submitting form data:', error);
        res.status(500).send('There was an error submitting your form. Please try again later.');
      })
      .finally(() => {
        // Save the form data to MySQL
        const query = 'INSERT INTO enquiryform (name, email, phone, course, city) VALUES (?, ?, ?, ?, ?)';
        const values = [efname, efemail, efphone, efcourse, efcity];
  
        connection.query(query, values, (err, result) => {
          if (err) {
            console.error('Error saving form data to MySQL:', err);
            return res.status(500).send('Internal Server Error');
          }
  
          // Send form data as an email using Mailgun
          const mg = mailgun({
            apiKey: '864d92ccca4a4fb6d86873f898ab23f4-6d8d428c-d5579fe9', // Replace with your Mailgun API key
            domain: 'sandbox2636d284a2034591af3a83bed7cf00c9.mailgun.org', // Replace with your Mailgun domain
          });
  
          const data = {
            from: efemail,
            to: 'digitalmarketing@kapilguru.com',
            subject: 'This e-mail was sent from enquiry page',
            text: `Name: ${efname}\nEmail: ${efemail}\nPhone: ${efphone}\nCity: ${efcity}\nThis e-mail was sent from enquiry page`,
          };
  
          mg.messages().send(data, (error, body) => {
            if (error) {
              console.error('Error sending email:', error);
            } else {
              console.log('Email sent:', body);
            }
          });
          
        });
      });
    
  });
  
  // slp enquiry form data
  app.post('/slp-enquiry-form-data', (req, res) => {
    const { slpefname, slpefemail, slpefphone, slpefcourse, slpefcity } = req.body;
  if (!slpefname || !slpefemail || !slpefphone || !slpefcourse || !slpefcity) {
      console.error('Please fill in all required field');
      return res.status(400).send('Please fill in all required fields');
    }
  
    const kylasapiData = {
      firstName: slpefname,
      lastName: '',
      phoneNumbers: [
        {
          type: 'MOBILE',
          code: 'IN',
          value: slpefphone,
          dialCode: '91',
          primary: true,
        },
      ],
      emails: [
        {
          type: 'OFFICE',
          value: slpefemail,
          primary: true,
        },
      ],
      customFieldValues: {
        cfEnquiredCourse: slpefcourse,
        city: slpefcity,
      },
      source: 1056041,
    };
  
    axios
      .post('https://api.kylas.io/v1/leads/', kylasapiData, {
        headers: {
          'api-key': '944d1a61-c3cb-454b-96cc-018894f679c8:7549', // API KEY Here
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      .then(() => {
        const successMessage = `Thank you for your submission, ${slpefname}! We will contact you at ${slpefphone} or ${slpefemail} regarding the ${slpefcourse} course.`;
        res.status(200).send(successMessage);
      })
      .catch((error) => {
        console.error('Error submitting form data:', error);
        res.status(500).send('There was an error submitting your form. Please try again later.');
      })
      .finally(() => {
        // Save the form data to MySQL
        const query = 'INSERT INTO slpenquiryForm (name, email, phone, course, city) VALUES (?, ?, ?, ?, ?)';
        const values = [slpefname, slpefemail, slpefphone, slpefcourse, slpefcity];
  
        connection.query(query, values, (err, result) => {
          if (err) {
            console.error('Error saving form data to MySQL:', err);
            return res.status(500).send('Internal Server Error');
          }
  
          // Send form data as an email using Mailgun
          const mg = mailgun({
            apiKey: '864d92ccca4a4fb6d86873f898ab23f4-6d8d428c-d5579fe9', // Replace with your Mailgun API key
            domain: 'sandbox2636d284a2034591af3a83bed7cf00c9.mailgun.org', // Replace with your Mailgun domain
          });
  
          const data = {
            from: slpefemail,
            to: 'digitalmarketing@kapilguru.com',
            subject: 'This e-mail was sent from SLP Enquiry page',
            text: `Name: ${slpefname}\nEmail: ${slpefemail}\nPhone: ${slpefphone}\nCourse: ${slpefcourse}\nCity: ${slpefcity}\nThis e-mail was sent from SLP Enquiry page`,
          };
  
          mg.messages().send(data, (error, body) => {
            if (error) {
              console.error('Error sending email:', error);
            } else {
              console.log('Email sent:', body);
            }
          });
        });
      });
    
  });


  module.exports = {
    websiteFormDataApp: app
  } 