const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');


app.get('/xmldata-api', (req, res) => {
    fs.readFile('./src/global_schema.xml', 'utf8', (err,data) =>{
        if(err){
            console.error(err);
            return;
        }
        res.json({ text: data });
    });
});

app.use(express.static('src'));

app.get('', (req, res) =>{
    res.sendFile(__dirname + '/src/index.html');
})



app.listen(port, () => console.info(`Listening on port ${port}`));

process.on('SIGINT', function() {
    console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
    process.exit(0);
});