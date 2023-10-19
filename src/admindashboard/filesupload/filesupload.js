const express = require('express');
const multer = require('multer');
const app = express();
const connection = require('../../db/connection');


const ds = multer.diskStorage({
    destination: "storage/",
    filename:(req, file, cd) => {
        cd(null, Date.now()+file.originalname)
    }
})

const upload = multer({
    storage: ds
})

app.post('/storage/upload', upload.single('image'), (req, res) => {
    if(!req.file){
        return res.status(400).send('No file uploaded');
    }
    res.status(200).send("file uploaded successfully")
});