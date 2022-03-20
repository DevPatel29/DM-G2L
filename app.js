const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');


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


app.post('/csvdata-api', (req,res)=>{
    var path = req.body.path;
    // console.log(path);
    fs.readFile(path, 'utf8', (err,data) =>{
        if(err){
            console.error(err);
            return;
        }
        res.json({ text: data });
    });
});


app.listen(port, () => console.info(`Listening on port ${port}`));

process.on('SIGINT', function() {
    console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
    process.exit(0);
});