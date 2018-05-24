/**
 * Module dependencies.
 */

var express = require('express');
const session = require('express-session');
const logger = require('morgan');
const MongoStore = require('connect-mongo')(session);
const cookieParser = require('cookie-parser');
const passport = require('passport');
const promisify = require('es6-promisify');
const flash = require('connect-flash');
const expressValidator = require('express-validator');

var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
require('dotenv').config({ path: 'variables.env' });

var favicon = require('serve-favicon');
var methodOverride = require('method-override');

// the ExpressJS App
var app = express();

// configuration of port, templates (/views), static files (/public)
// and other expressjs settings for the web server.

// server port number
app.set('port', process.env.PORT || 5000);

//  templates directory to 'views'
app.set('views', __dirname + '/views');

// setup template engine - we're using Hogan-Express
app.set('view engine', 'html');
app.set('layout', 'layout');
app.engine('html', require('hogan-express')); // https://github.com/vol4ok/hogan-express

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

// connecting to database
mongoose.connect(process.env.DATABASE, { useMongoClient: true });
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on('error', (err) => {
    console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
})

// ROUTES, logic is in routes/index.js

var routes = require('./routes/index.js');

// home page
app.get('/', routes.index); // calls index function in /routes/index.js

//add new food routes
app.get('/add', routes.addFoodForm); //display form to add a new food product
app.post('/add', routes.addFoodToDb); //form POST submits here

// display a single food item
// for example '/food/chunky-peanut-butter'
app.get('/food/:slug', routes.oneFood);

// edit food item
app.get('/food/:slug/edit', routes.editFoodForm); //GET the edit form
app.post('/food/:slug/edit', routes.updateFoodToDb); //PUT - update food

// delete a food
app.get('/food/:slug/delete', routes.deleteFood);

// increment food's upvotes
app.get('/food/:slug/upvote', routes.incrementUpvote);

// Make the data into an API - JSON Data routes
app.get('/api/food', routes.allFoodApi);
app.get('/api/food/:slug', routes.oneFoodApi);

// create NodeJS HTTP server using 'app'
http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});