// ----------------------------------- Show that something is happening --------------------------
// ------------------------------------------------------------------------------------------------
console.log('Loading Server');
const WEB = '/home/ubuntu/workspace/Students/web';
// Can also use const WEB = __dirname.replace('server', 'web');

// ----------------------------------- Load main modules ------------------------------------------
// ------------------------------------------------------------------------------------------------
var express = require('express');
var fs = require('fs');

// ----------------------------------- Load express middleware modules ----------------------------
// ------------------------------------------------------------------------------------------------
var logger = require('morgan');
var compression = require('compression');
var favicon = require('serve-favicon');
var  bodyParser = require('body-parser');

// ----------------------------------- create express app -----------------------------------------
// ------------------------------------------------------------------------------------------------
var app = express();

// ------------------------------------- Insert Middleware-----------------------------------------
// ------------------------------------------------------------------------------------------------
app.use(logger('dev'));
app.use(compression());
app.use(favicon(WEB + '/img/uvuFavicon.png'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// ----------------------------------- REST end points --------------------------------------------
// ------------------------------------------------------------------------------------------------

// --------------------------------------- Post ---------------------------------------------------
// ------------------------------------------------------------------------------------------------
app.post("/api/v1/students", function (req, res) {
    var data = JSON.stringify(req.body);
    
    fs.readdir(__dirname + '/students', function(err, files) {
       if (err) throw err;
       
       files.sort();
       var lastFile = files.pop();
       var lastFileID = lastFile.replace('.json', '');
       var id = ('0000' + (++lastFileID)).slice(-4);
       fs.writeFile(`${__dirname}/students/${id}.json`, data, 'utf8', function(err) {
            if (err) throw err;
            res.status(200).json(id + '.json');
        });
    });
});

// ---------------------------------------- Get ---------------------------------------------------
// ------------------------------------------------------------------------------------------------
app.get("/api/v1/students/:id.json", function(req, res) {
    var id = req.params.id;
    fs.readFile(`${__dirname}/students/${id}.json`, 'utf8', function (err, fileContents){
        if (err) throw err;
        
        var parsedFileContents = JSON.parse(fileContents);
        res.status(201).json(parsedFileContents);
    });
});

// --------------------------------------- Update/Put ---------------------------------------------
// ------------------------------------------------------------------------------------------------
app.put("/api/v1/students/:id.json", function (req, res) {
    var id = req.params.id;
    var data = JSON.stringify(req.body);
    
    fs.writeFile(`${__dirname}/students/${id}.json`, data, 'utf8', function(err) {
        if (err) throw err;
        
        res.sendStatus(204);
    });
});

// --------------------------------------- Delete -------------------------------------------------
// ------------------------------------------------------------------------------------------------
app.delete("/api/v1/students/:id.json", function (req, res) {
    var id = req.params.id;
    fs.unlink(`${__dirname}/students/${id}.json`, function (err, fileContents){
        if (err) throw err;
        
        res.sendStatus(204);
    });
});

// --------------------------------------- List ---------------------------------------------------
// ------------------------------------------------------------------------------------------------
app.get("/api/v1/students", function(req, res) {
    fs.readdir(__dirname + '/students', function(err, files) {
        if (err) throw err;
        
        res.status(200).json(files)
    });
});

// ----------------------------------- traditional webserver stuff for serving static files -------
// ------------------------------------------------------------------------------------------------
app.use(express.static(WEB));
app.get('*', function(req, res) {
    res.status(404).sendFile(WEB + '/404Error.html');
});

var server = app.listen(process.env.PORT);

// ----------------------------------- Gracefullly shutdown ---------------------------------------
// ------------------------------------------------------------------------------------------------
function gracefullShutdown() {
    console.log('\nStarting Shutdown');
    server.close(function() {
        console.log('\nShutdown Complete');
    });
}

process.on('SIGTERM', gracefullShutdown);
process.on('SIGINT', gracefullShutdown);

console.log('Now listening');