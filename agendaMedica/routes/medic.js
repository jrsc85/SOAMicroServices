var express = require('express');
var router = express.Router();
const AWS = require("aws-sdk");
const serverless = require("serverless-http");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
var jsonParser = bodyParser.json();

/**************************************************/
//---------------------MEDICO-----------------------

router.get("/", function(req, res){
        res.send({"stage": "dev"})
})



//Crear nuevo doctor
router.post("/createDoctor", jsonParser, function(req, res){
    let id =  uuid4();
    let date = new Date().toLocaleString('es-MX', {timeZone: 'America/Mexico_City'});

    (async () => {
        try{
            let data = {
                "pk": "Doctor",
                "sk": id,
                "nombres": req.body.user_names,
                "apellido_P": req.body.apellidoP,
                "apellido_M": req.body.apellidoM,
                "genero": req.body.genero,
                "fechaNacimiento": req.body.fechaNacimiento,
                "estado": req.body.estado,
                "ciudad": req.body.ciudad,
                "email": req.body.email,
                "password": req.body.password,
                "createdAt": date,
                "changedAt": date
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

//Obtener datos del dotor por medio de su sk
router.get("/medicInfo/:sk", function(req, res){
    (async ()=> {
        try{
            var params = {
                 //Nombre de la tabla a la que hará referencia
                TableName: "medic_schedule_a",
                KeyConditionExpression: "pk = :pk",
                ExpressionAttributeValues: {
                    ":pk": "Doctor",
                    ":sk": req.params.sk
                },
                ExpressionAttributeNames:{
                    "#sk": "sk"
                },
                /*#sk representa la columna de la base de datos
                  :sk representa lo que mandamos */
                FilterExpression: "#sk = :sk"
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

//Actualizar datos
router.put("/update/DoctorData/:sk", jsonParser, function(req, res){
    var params = {
         //Nombre de la tabla a la que hará referencia
        TableName: "school_a", 
        Key: {
            "pk": "Patient",
            "sk": req.param.sk
        },
        UpdateExpression: "set nombres = :n,"+
            "apellido_P = :apP," + 
            "apellido_M = apM," + 
            "email = :e" + 
            "genero = :g" +
            "fechaNacimiento = :fn" + 
            "estado = :est" +
            "ciudad = :c",
        ExpressionAttributeValues: {
            ":n": req.body.user_names,
            ":apP": req.body.apellidoP,
            ":apM": req.body.apellidoM,
            ":e": req.body.email,
            ":g": req.body.genero,
            ":fn": req.body.fechaNacimiento,
            ":est": req.body.estado,
            ":c": req.body.ciudad,
            "changedAt": date
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

//Borrar cuenta
router.delete("/deleteDoctor/:sk", function(req, res){
    var params = {
        //Nombre de la tabla a la que hará referencia
        TableName: "medic_schedule_a", 
        Key: {
            "pk": "Doctor",
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

module.exports = router;