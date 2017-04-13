// ----------------------------------- Show that something is happening --------------------------
// ------------------------------------------------------------------------------------------------
console.log('Loading Server');
const WEB = __dirname.replace('server', 'web');

// ----------------------------------- Load main modules ------------------------------------------
// ------------------------------------------------------------------------------------------------
var express = require('express');
var fs = require('fs');

// ----------------------------------- Load express middleware modules ----------------------------
// ------------------------------------------------------------------------------------------------
var logger = require('morgan');
var compression = require('compression');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var colors = require('colors');
var nconf = require('nconf');
var winston = require('winston');

// ----------------------------------- Testing New NPM Package ------------------------------------
// ------------------------------------------------------------------------------------------------
console.log('SOOOOMEEWHERE OVER THE RAINBOWWWW!'.rainbow);

nconf.argv()
   .env()
   .file({ file: 'path/to/config.json' });
 
// 
// Set a few variables on `nconf`. 
// 
nconf.set('testVariable', 'My name is ')
nconf.set('database:host', '127.0.0.1');
nconf.set('database:port', 5984);

// 
// Get the entire database object from nconf. This will output 
// { host: '127.0.0.1', port: 5984 } 
// 
console.log('foo: ' + nconf.get('foo'));
console.log('NODE_ENV: ' + nconf.get('NODE_ENV'));
console.log('database: ' + nconf.get('database:host'));

var winston = require('winston');
 
winston.log('info', 'Hello distributed log files!');
winston.info('Hello again distributed logs');

winston.level = 'debug';
winston.log('debug','Now my debug messages are written to console');

var testWinstonLogger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({ filename: 'winstonLog.log' })
    ]
  });

testWinstonLogger.log('debug', 'Where does this one end up');
testWinstonLogger.info('Testing out the info for the new logger');
testWinstonLogger.info('Looks like these go out to the file aaaand the console');


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
    fs.readdir(__dirname + '/students', function(err, files) {
       if (err) throw err;
       
       files.sort();
       var lastFile = files.pop();
       var lastFileID = lastFile.replace('.json', '');
       var id = ('0000' + (++lastFileID)).slice(-4);
       req.body.id = id + '.json';
       var data = JSON.stringify(req.body);
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

var server = app.listen(3000);

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