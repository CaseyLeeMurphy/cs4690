// ----------------------------------- Show that something is happening --------------------------
// ------------------------------------------------------------------------------------------------
console.log('Loading Server');
const WEB = __dirname.replace('server', 'web');

// ----------------------------------- Load main modules ------------------------------------------
// ------------------------------------------------------------------------------------------------
const express = require('express');
const fs = require('fs');
const studentData = require('./studentsMongoDao');

// ----------------------------------- Load express middleware modules ----------------------------
// ------------------------------------------------------------------------------------------------
const logger = require('morgan');
const compression = require('compression');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const colors = require('colors');
const nconf = require('nconf');
const winston = require('winston');

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
    studentData.post(req.body, (err, result) => {
        if (err) {
            res.status(500).send("There was a problem inserting that record into the database");
        } else {
            console.log("Inserted student with newID of " + result);
            res.status(200).send(result);
        }    
    });
});

// ---------------------------------------- Get ---------------------------------------------------
// ------------------------------------------------------------------------------------------------
app.get("/api/v1/students/:id", function(req, res) {
    var id = req.params.id;

    studentData.read(id, (err, result) => {
        if (err) {
            res.status(500).send("There was a problem reading that ID from the database");
        } else {
            res.status(201).send(result);
        }    
    });
});

// --------------------------------------- Update/Put ---------------------------------------------
// ------------------------------------------------------------------------------------------------
app.put("/api/v1/students/:id", function (req, res) {
    var id = req.params.id;
    var data = req.body;
    
    studentData.update(id, data, (err, result) => {
        if (err) {
            res.status(500).send("There was a problem updating that ID in the database");
        } else {
            console.log("Updated student with ID" + id);
            res.status(204).send();
        }    
    });
});

// --------------------------------------- Delete -------------------------------------------------
// ------------------------------------------------------------------------------------------------
app.delete("/api/v1/students/:id", function (req, res) {
    var id = req.params.id;

    studentData.delete(id, (err, result) => {
        if (err) {
            res.status(500).send("There was a problem deleting that ID from the database");
        } else {
            console.log("Deleted student with ID" + id);
            res.status(204).send();
        }    
    });
});

// --------------------------------------- List ---------------------------------------------------
// ------------------------------------------------------------------------------------------------
app.get("/api/v1/students", function(req, res) {
    studentData.list((err, result) => {
        if (err) {
            res.status(500).send("There was a problem getting students from the database");
        } else {
            res.status(201).send(result);
        }    
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