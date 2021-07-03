const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const bodyParser = require("body-parser");
const AWS = require("aws-sdk");
const {v4: uuid4} = require("uuid");


var medicService = require('./routes/medic');
var dynamodb=new AWS.DynamoDB.DocumentClient({region: 'us-east-2'});

var jsonParser = bodyParser.json();
const app = express();
app.use(cors());


app.use('/medic', medicService);

app.get("/", function(req, res){
        res.send({"stage": "dev"});
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


/**************************************************************************/
//-------------------------------PACIENTE------------------------------------

//Crear paciente
app.post("/createPacient", jsonParser, function(req, res){
    let id =  uuid4();
    let date = new Date().toLocaleString('es-MX', {timeZone: 'America/Mexico_City'});

    (async () => {
        try{
            let data = {
                "pk": "Patient",
                "sk": "Patient-" + id,
                "nombres": req.body.nombres,
                "apellido_P": req.body.apellido_P,
                "apellido_M": req.body.apellido_M,
                "genero": req.body.genero,
                "fechaNacimiento": req.body.fechaNacimiento,
                "estado": req.body.estado,
                "ciudad": req.body.ciudad,
                "telefono": req.body.telefono,
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

//Obtener datos del paciente por medio de su SK
app.get("/getPacient/:sk", function(req, res){
    (async ()=> {
        try{
            var params = {
                 //Nombre de la tabla a la que hará referencia
                TableName: "medic_schedule_a",
                KeyConditionExpression: "pk = :pk AND sk = :sk",
                ExpressionAttributeValues: {
                    ":pk": "Patient",
                    ":sk":req.params.sk
                }
            };

            dynamodb.query(params, function(err, response){
                if(err){
                    res.status(500).send(err);
                    console.log(req.params);
                }else{
                    res.status(200).send(response.Items);
                }
            });

        }catch(error){
            res.status(500).send(error);
        }
    })();
});

//Actualizar datos del paciente, menos su contraseña
app.put("/updatePatient/:sk", jsonParser, function(req, res){
    let date = new Date().toLocaleString('es-MX', {timeZone: 'America/Mexico_City'});

    var params = {
         //Nombre de la tabla a la que hará referencia
        TableName: "medic_schedule_a", 
        Key: {
            "pk": "Patient",
            "sk": req.params.sk
        },
        UpdateExpression: "set nombres = :n,"+
            "apellido_P = :apP," + 
            "apellido_M = :apM," + 
            "genero = :g," +
            "fechaNacimiento = :fn," + 
            "estado = :est," +
            "ciudad = :c," +
            "telefono = :tel," +
            "email = :e," +
            "changedAt = :chang",
        ExpressionAttributeValues: {
            ":n": req.body.nombres,
            ":apP": req.body.apellido_P,
            ":apM": req.body.apellido_M,
            ":e": req.body.email,
            ":tel": req.body.telefono,
            ":g": req.body.genero,
            ":fn": req.body.fechaNacimiento,
            ":est": req.body.estado,
            ":c": req.body.ciudad,
            ":chang": date
        },
        ReturnValues: "UPDATED_NEW"
    };

    dynamodb.update(params, function(err, response){
        if(err){
            res.status(500).send(err);
            console.log(req.body);
        }else{
            res.status(200).send(response);
        }
    });
});

//Borrar paciente -HAY QUE CONSIDERAR SI LO BORRAMOS O HACER UN "STATUS: INNACTIVE"-
app.delete("/deletePatient/:sk", function(req, res){
    var params = {
        //Nombre de la tabla a la que hará referencia
        TableName: "medic_schedule_a", 
        Key: {
            "pk": "Patient",
            "sk": req.params.sk
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

/**************************************************/
//---------------------MEDICO-----------------------
//Crear nuevo doctor
app.post("/createDoctor", jsonParser, function(req, res){
    let id =  uuid4();
    let date = new Date().toLocaleString('es-MX', {timeZone: 'America/Mexico_City'});

    (async () => {
        try{
            let data = {
                "pk": "Doctor",
                "sk": "Doctor-" + id,
                "nombres": req.body.nombres,
                "apellido_P": req.body.apellido_P,
                "apellido_M": req.body.apellido_M,
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

//Obtener datos del doctor por medio de su SK
app.get("/getDoctor/:sk", function(req, res){
    (async ()=> {
        try{
            var params = {
                 //Nombre de la tabla a la que hará referencia
                TableName: "medic_schedule_a",
                KeyConditionExpression: "pk = :pk AND sk = :sk",
                ExpressionAttributeValues: {
                    ":pk": "Doctor",
                    ":sk": req.params.sk
                }
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
app.put("/update/DoctorData/:sk", jsonParser, function(req, res){
    let date = new Date().toLocaleString('es-MX', {timeZone: 'America/Mexico_City'});
    var params = {
         //Nombre de la tabla a la que hará referencia
        TableName: "medic_schedule_a", 
        Key: {
            "pk": "Doctor",
            "sk": req.params.sk
        },
        UpdateExpression: "set nombres = :n,"+
            " apellido_P = :apP," + 
            " apellido_M = :apM," + 
            " email = :e," + 
            " genero = :g," +
            " fechaNacimiento = :fn," + 
            " estado = :est," +
            " ciudad = :c," +
            " changedAt = :chang",
        ExpressionAttributeValues: {
            ":n": req.body.nombres,
            ":apP": req.body.apellido_P,
            ":apM": req.body.apellido_M,
            ":e": req.body.email,
            ":g": req.body.genero,
            ":fn": req.body.fechaNacimiento,
            ":est": req.body.estado,
            ":c": req.body.ciudad,
            ":chang": date
        },
        ReturnValues: "UPDATED_NEW"
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
app.delete("/deleteDoctor/:sk", function(req, res){
    var params = {
        //Nombre de la tabla a la que hará referencia
        TableName: "medic_schedule_a", 
        Key: {
            "pk": "Doctor",
            "sk": req.params.sk
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

/*****************************************************************/
//-----------------------DEPARTAMENTO------------------------------

//Crear nueva ubicación de consultorio
app.post("/createLocation", jsonParser, function(req, res){
    let id =  uuid4();
    let date = new Date().toLocaleString('es-MX', {timeZone: 'America/Mexico_City'});

    (async () => {
        try{
            let data = {
                "pk": "D-Department",
                "sk": "Location-" + id,

                //Aquí se pondría la SK del doctor
                "doctor": req.body.doctor,

                "nombreDep": req.body.nombreDep,
                "estado": req.body.estado,
                "ciudad": req.body.ciudad,
                "CP": req.body.CP,
                "fraccionamiento": req.body.fraccionamiento,
                "calle": req.body.calle,
                "numExterior": req.body.numExterior,
                "numInterior": req.body.numInterior,
                "telefono": req.body.telefono,
                "telefono2": req.body.telefono2,
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
                    console.log(req.body);
                }
            });

        }catch(error){
            return res.status(500).send(error);
        }
    })();
});

//Obtener lista de ubicaciones (departamentos)
app.get("/doctor/locationList/:doctor", function(req, res){
    (async ()=> {
        try{
            var params = {
                 //Nombre de la tabla a la que hará referencia
                TableName: "medic_schedule_a",
                KeyConditionExpression: "pk = :pk",
                ExpressionAttributeValues: {
                    ":pk": "D-Department",
                    ":doctor":req.params.doctor,
                },
                ExpressionAttributeNames:{
                    "#doctor": "doctor"
                },
                /*#sk representa la columna de la base de datos
                  :sk representa lo que mandamos */

                FilterExpression: "#doctor = :doctor"
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

//Obtener información de departamento
app.get("/doctor/locationInfo/:skDepartment", function(req, res){
    (async ()=> {
        try{
            var params = {
                 //Nombre de la tabla a la que hará referencia
                TableName: "medic_schedule_a",
                KeyConditionExpression: "pk = :pk AND sk = :skDepartment",
                ExpressionAttributeValues: {
                    ":pk": "D-Department",
                    ":skDepartment": req.params.skDepartment
                }
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

//Actualizar localización
app.put("/update/locationData/:skLocation", jsonParser, function(req, res){
    let date = new Date().toLocaleString('es-MX', {timeZone: 'America/Mexico_City'});
    var params = {
         //Nombre de la tabla a la que hará referencia
        TableName: "medic_schedule_a", 
        Key: {
            "pk": "D-Department",
            "sk": req.params.skLocation
        },
        UpdateExpression: "set nombreDep = :nD,"+
            " estado = :est," +
            " ciudad = :c," +
            " CP = :cp," + 
            " fraccionamiento = :frcc," + 
            " calle = :cll," + 
            " numExterior = :numE," +
            " numInterior = :numI," + 
            " telefono = :telUno," + 
            " telefono2 = :telDos," + 
            " changedAt = :chang",
        ExpressionAttributeValues: {
            ":nD": req.body.nombreDep,
            ":est": req.body.estado,
            ":c": req.body.ciudad,
            ":cp": req.body.CP,
            ":frcc": req.body.fraccionamiento,
            ":cll": req.body.calle,
            ":numE": req.body.numExterior,
            ":numI": req.body.numInterior,
            ":telUno": req.body.telefono,
            ":telDos": req.body.telefono2,
            ":chang": date
        },
        ReturnValues: "UPDATED_NEW"
    };

    dynamodb.update(params, function(err, response){
        if(err){
            res.status(500).send(err);
        }else{
            res.status(200).send(response);
        }
    });
});

app.delete("/deleteLocation/:skLocation", function(req, res){
    var params = {
        //Nombre de la tabla a la que hará referencia
        TableName: "medic_schedule_a", 
        Key: {
            "pk": "D-Department",
            "sk": req.params.skLocation
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

/******************************************************/
//------------------------AGENDA------------------------

//Crear cita
app.post("/createDate", jsonParser, function(req, res){
    let id =  uuid4();
    let date = new Date().toLocaleString('es-MX', {timeZone: 'America/Mexico_City'});

    (async () => {
        try{
            let data = {
                "pk": "S-Schedule",
                "sk": "Schedule-" + id,
                "fecha": req.body.fecha,
                "hora": req.body.hora,

                //Aquí se pondría el sk del paciente
                "paciente":req.body.paciente,

                //Aquí se pondría el sk del doctor
                "doctor":req.body.doctor,

                "estadoConsulta": "ACTIVO",
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

//Obtener lista de citas (para los pacientes)
app.get("/scheduleList/patient/:paciente", function(req, res){
    (async ()=> {
        try{
            var params = {
                 //Nombre de la tabla a la que hará referencia
                TableName: "medic_schedule_a",
                KeyConditionExpression: "pk = :pk",
                ExpressionAttributeValues: {
                    ":pk": "S-Schedule",
                    ":paciente":req.params.paciente,
                },
                ExpressionAttributeNames:{
                    "#paciente": "paciente"
                },
                /*#sk representa la columna de la base de datos
                  :sk representa lo que mandamos */

                FilterExpression: "#paciente = :paciente"
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

//Obtener lista de citas (para los doctores)
app.get("/scheduleList/doctor/:doctor", function(req, res){
    (async ()=> {
        try{
            var params = {
                 //Nombre de la tabla a la que hará referencia
                TableName: "medic_schedule_a",
                KeyConditionExpression: "pk = :pk",
                ExpressionAttributeValues: {
                    ":pk": "S-Schedule",
                    ":doctor":req.params.doctor,
                },
                ExpressionAttributeNames:{
                    "#doctor": "doctor"
                },
                /*#sk representa la columna de la base de datos
                  :sk representa lo que mandamos */

                FilterExpression: "#doctor = :doctor"
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

//Obtener información de cita (para pacientes y doctores)
app.get("/getSchedule/:sk", function(req, res){
    (async ()=> {
        try{
            var params = {
                 //Nombre de la tabla a la que hará referencia
                TableName: "medic_schedule_a",
                KeyConditionExpression: "pk = :pk AND sk = :sk",
                ExpressionAttributeValues: {
                    ":pk": "S-Schedule",
                    ":sk":req.params.sk,
                }
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

//Cambiar fecha y hora de cita
app.put("/update/ScheduleDate/:sk", jsonParser, function(req, res){
    let date = new Date().toLocaleString('es-MX', {timeZone: 'America/Mexico_City'});
    var params = {
         //Nombre de la tabla a la que hará referencia
        TableName: "medic_schedule_a", 
        Key: {
            "pk": "S-Schedule",
            "sk": req.params.sk
        },
        UpdateExpression: "set fecha = :f,"+
            " hora = :h," + 
            " changedAt = :chang",
        ExpressionAttributeValues: {
            ":f": req.body.fecha,
            ":h": req.body.hora,
            ":chang": date
        },
        ReturnValues: "UPDATED_NEW"
    };

    dynamodb.update(params, function(err, response){
        if(err){
            res.status(500).send(err);
        }else{
            res.status(200).send(response);
        }
    });
});

//Cancelar cita (Esto se puede usar para cambiar el estado de la cita a otros estados, como ASISTIDO, OLVIDADO, etc)
app.put("/update/ScheduleStatus/:sk", jsonParser, function(req, res){
    let date = new Date().toLocaleString('es-MX', {timeZone: 'America/Mexico_City'});
    var params = {
         //Nombre de la tabla a la que hará referencia
        TableName: "medic_schedule_a", 
        Key: {
            "pk": "S-Schedule",
            "sk": req.params.sk
        },
        UpdateExpression: "set estadoConsulta = :eC," + 
            "changedAt = :chang",
        ExpressionAttributeValues: {
            ":eC": "CANCELADO",
            ":chang": date
        },
        ReturnValues: "UPDATED_NEW"
    };

    dynamodb.update(params, function(err, response){
        if(err){
            res.status(500).send(err);
        }else{
            res.status(200).send(response);
        }
    });
});

/******************************************************************************* */
//------------------------------DATOS MÉDICOS-----------------------------------

//Crear expediente (datos médicos)--- Se debe validar el hecho de que por cada usuario solo tenga un expediente
app.post("/pacient/proceedings", jsonParser, function(req, res){
    let id =  uuid4();
    let date = new Date().toLocaleString('es-MX', {timeZone: 'America/Mexico_City'});

    (async () => {
        try{
            let data = {
                "pk": "P-Proceedings",
                "sk": "Proceeding-" + id,
                "paciente": req.body.paciente,
                "peso": req.body.peso,
                "altura": req.body.altura,
                "doctor": req.body.doctor,
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

//Obtener datos del paciente por medio de su SK
app.get("/getPacient/proceeding/:skProceeding", function(req, res){
    (async ()=> {
        try{
            var params = {
                 //Nombre de la tabla a la que hará referencia
                TableName: "medic_schedule_a",
                KeyConditionExpression: "pk = :pk AND sk = :skProceeding",
                ExpressionAttributeValues: {
                    ":pk": "P-Proceedings",
                    ":skProceeding":req.params.skProceeding
                }
            };

            dynamodb.query(params, function(err, response){
                if(err){
                    res.status(500).send(err);
                    console.log(req.params);
                }else{
                    res.status(200).send(response.Items);
                }
            });

        }catch(error){
            res.status(500).send(error);
        }
    })();
});

//Actualizar datos del paciente, menos su contraseña
app.put("/updatePatient/proceeding/:skProceeding", jsonParser, function(req, res){
    let date = new Date().toLocaleString('es-MX', {timeZone: 'America/Mexico_City'});

    var params = {
         //Nombre de la tabla a la que hará referencia
        TableName: "medic_schedule_a", 
        Key: {
            "pk": "P-Proceedings",
            "sk": req.params.skProceeding
        },
        UpdateExpression: "set peso = :p,"+
            "altura = :a," +
            "doctor = :d,"+
            "changedAt = :chang",
        ExpressionAttributeValues: {
            ":p": req.body.peso,
            ":a": req.body.altura,
            ":d": req.body.doctor,
            ":chang": date
        },
        ReturnValues: "UPDATED_NEW"
    };

    dynamodb.update(params, function(err, response){
        if(err){
            res.status(500).send(err);
            console.log(req.body);
        }else{
            res.status(200).send(response);
        }
    });
});

//Borrar expediente, esto solo debe hacerse a la hora de borrar un paciente
app.delete("/deletePatient/proceeding/:skProceeding", function(req, res){
    var params = {
        //Nombre de la tabla a la que hará referencia
        TableName: "medic_schedule_a", 
        Key: {
            "pk": "P-Proceedings",
            "sk": req.params.skProceeding
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
/****************************************************************************************/


var server = app.listen(4000, function(){
    console.log("Corriendo en puerto 4000");
});

module.exports.handler = serverless(app);