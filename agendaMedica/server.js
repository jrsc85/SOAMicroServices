const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const bodyParser = require("body-parser");
const AWS = require("aws-sdk");
const {v4: uuid4} = require("uuid");


var medicService = require('./routes/medic');
var home = require('./routes/Home');
var path = require('path');
var dynamodb=new AWS.DynamoDB.DocumentClient({region: 'us-east-2'});



var jsonParser = bodyParser.json();
const app = express();
app.use(cors());


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use('/medic', medicService);
app.use("/",home);

app.post("/createPacient", jsonParser, function(req, res){
    let id =  uuid4();
    let date = new Date().toLocaleString('es-MX', {timeZone: 'America/Mexico_City'});

    (async () => {
        try{
            let data = {
                "pk": "Patient",
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

app.get("getAll", function(req, res){
    var params = {
         //Nombre de la tabla a la que hará referencia
         TableName: "medic_schedule_a"
    };

    dynamodb.scan(params, function(err, response){
        if(err){
            res.status(500).send(error);
        }else{
            res.status(200).send(response);
        }
    });
});


app.get("/getPacient/:name", function(req, res){
    (async ()=> {
        try{
            var params = {
                 //Nombre de la tabla a la que hará referencia
                TableName: "medic_schedule_a",
                KeyConditionExpression: "pk = :pk",
                ExpressionAttributeValues: {
                    ":pk": "Patient",
                    ":username": req.params.username
                },
                ExpressionAttributeNames:{
                    "#username": "username"
                },
                /*#username representa la columna de la base de datos
                  :username representa lo que mandamos */

                FilterExpression: "#username = :username"
            };

            dynamodb.query(params, function(err, response){
                if(err){
                    res.status(500).send(err);
                }else{
                    res.status(200).send(response.Items);
                }
            });

        }catch(error){
            res.status(500).send(error);
        }
    })();
});


app.put("/updatePatient/:sk", jsonParser, function(req, res){
    var params = {
         //Nombre de la tabla a la que hará referencia
        TableName: "school_a", 
        Key: {
            "pk": "Patient",
            "sk": req.param.sk
        },
        UpdateExpression: "set lastname = :l, email = :e",
        ExpressionAttributeValues: {
            ":l": req.body.lastname,
            ":e": req.body.email
        },
        ReturnValues: "UPDATE_NEW"
    };

    dynamodb.update(params, function(err, response){
        if(err){
            res.status(500).send(err);
        }else{
            res.status(200).send(response);
        }
    });
});

app.delete("/deletePatient/:sk", function(req, res){
    var params = {
        //Nombre de la tabla a la que hará referencia
        TableName: "medic_schedule_a", 
        Key: {
            "pk": "Patient",
            "sk": req.param.sk
        }
    };

    dynamodb.delete(params, function(err, response){
        if(err){
            res.status(500).send(err);
        }else{
            res.status(200).send("Deleted");
        }
    });
});



var server = app.listen(4000, function(){
    console.log("Corriendo en puerto 4000");
});

module.exports.handler = serverless(app);