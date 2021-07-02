var express = require('express');
var router = express.Router();
const AWS = require("aws-sdk");
const serverless = require("serverless-http");
const cors = require("cors");
const bodyParser = require("body-parser");

var dynamodb=new AWS.DynamoDB.DocumentClient({region: 'us-east-2'});

var jsonParser = bodyParser.json();


router.get("/", function(req, res){
        res.send({"stage": "dev"})
})



router.post("/createMedic", jsonParser, function(req, res){
    let id =  uuid4();
    let date = new Date().toLocaleString('es-MX', {timeZone: 'America/Mexico_City'});

    (async () => {
        try{
            let data = {
                "pk": "Medic",
                "sk": id,
                "username": req.body.username,
                "lastname": req.body.lastname,
                "emai": req.body.email,
                "createdAt": date
            };

            var params = {
                Item: data,
                ReturnConsumedCapacity: "TOTAL",

                //Nombre de la tabla a la que hará referencia
                TableName: "medic_schedule_a"
            };

            dynamodb.put(params, function(err, response){
                if(err){
                    res.status(500).send(error);
                }else{
                    res.status(200).send(data);
                }
            });

        }catch(error){
            return res.status(500).send(error);
        }
    })();
});

module.exports = router;