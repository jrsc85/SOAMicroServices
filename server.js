const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const bodyParser = require("body-parser");
const AWS = require("aws-sdk");
const {v4: uuid4} = require("uuid");

var jsonParser = bodyParser.json();
const app = express();
app.use(cors());

app.get("/", function(req, res){
        res.send({"stage": "dev"})
})

app.post("/createStudent", jsonParser, function(req, res){
    let id =  uuid4();
    let date = new Date().toLocaleString('es-MX', {timeZone: 'America/Mexico_City'});

    (async () => {
        try{
            let data = {
                "pk": "Student",
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
                TableName: "school_a"
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
         TableName: "school_a"
    };

    dynamodb.scan(params, function(err, response){
        if(err){
            res.status(500).send(error);
        }else{
            res.status(200).send(response);
        }
    });
});


app.get("/getStudent/:name", function(req, res){
    (async ()=> {
        try{
            var params = {
                 //Nombre de la tabla a la que hará referencia
                TableName: "school_a",
                KeyConditionExpression: "pk = :pk",
                ExpressionAttributeValues: {
                    ":pk": "Student",
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


app.put("/updateStudent/:sk", jsonParser, function(req, res){
    var params = {
         //Nombre de la tabla a la que hará referencia
        TableName: "school_a", 
        Key: {
            "pk": "Student",
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

app.delete("/deleteStudent/:sk", function(req, res){
    var params = {
        //Nombre de la tabla a la que hará referencia
        TableName: "school_a", 
        Key: {
            "pk": "Student",
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