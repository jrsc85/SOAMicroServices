var express = require('express');
var router = express.Router();
const AWS = require("aws-sdk");
const serverless = require("serverless-http");
const cors = require("cors");
const bodyParser = require("body-parser");


/* GET home page. */
router.use('/',  function(req, res, next) {
    res.render('index', { title: 'Express'})
  });

 module.exports = router;