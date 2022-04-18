const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const mysql = require('mysql'); 
const Connection = require('mysql/lib/Connection');
let csvToJson = require('convert-csv-to-json');
const { json } = require('express');


app.use(express.static('src'));
app.use(express.json());


app.get('', (req, res) =>{
    res.sendFile(__dirname + '/src/index.html');
})


app.get('/xmldata-api', (req, res) => {
    fs.readFile('./src/global_schema.xml', 'utf8', (err,data) =>{
        if(err){
            console.error(err);
            return;
        }
        res.json({ text: data });
    });
});

app.get('/LS_gis', (req, res) => {
    fs.readFile('./src/LS_gis.xml', 'utf8', (err,data) =>{
        if(err){
            console.error(err);
            return;
        }
        res.json({ text: data });
    });
});

app.get('/LS_route', (req, res) => {
    fs.readFile('./src/LS_route.xml', 'utf8', (err,data) =>{
        if(err){
            console.error(err);
            return;
        }
        res.json({ text: data });
    });
});

app.get('/LS_other_details', (req, res) => {
    fs.readFile('./src/LS_other_details.xml', 'utf8', (err,data) =>{
        if(err){
            console.error(err);
            return;
        }
        res.json({ text: data });
    });
});


app.post('/csvdata-api', (req,res)=>{
    var path = req.body.path;
    let jsonRes = csvToJson.utf8Encoding().fieldDelimiter(',').formatValueByType().getJsonFromCsv(path);
    res.json(jsonRes);
});

app.post('/sqldata-api', (req,res)=>{
    var id = req.body.id;
    var password = req.body.password;
    var dbName = req.body.dbName;
    var tableName = req.body.tableName;

    // Connecting to mysql database;
    var connection = mysql.createConnection({
        host :'localhost',
        user: id,
        password: password,
        database: dbName
    });

    connection.connect(function(err){
        if(err){
            console.log(err);
        }
        else{
            console.log('Connected');
        }
        var qry = "SELECT * FROM " + tableName;
        connection.query(qry, function (err, result, fields) {
            if (err) throw err;
            res.json(result);
        });
    })
});


app.listen(port, () => console.info(`Listening on port ${port}`));

process.on('SIGINT', function() {
    console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
    process.exit(0);
});


// LOAD DATA LOCAL INFILE '/mnt/c/Users/Dev/Desktop/lat_long_stops.csv' 
// INTO TABLE lat_long_stops 
// FIELDS TERMINATED BY ',' 
// ENCLOSED BY '"'
// LINES TERMINATED BY '\n'
// IGNORE 1 ROWS;