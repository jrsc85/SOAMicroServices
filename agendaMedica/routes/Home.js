var express = require('express');
var router = express.Router();
const AWS = require("aws-sdk");
const serverless = require("serverless-http");
const cors = require("cors");
const bodyParser = require("body-parser");


/* GET home page. */
router.get('/', (req, res) => {
    res.render("index")
  })

 module.exports = router;