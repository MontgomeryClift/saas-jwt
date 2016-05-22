// Import dependencies
var express = require('express');
var morgan = require('morgan');
var passport = require('passport');
var mongoose = require('mongoose');
var port = 3000;
var config = require('./config/main');
var jade = require('jade');

// Initialize APP
app = express();

// Set & config template view engine
app.set('view engine', 'jade');
app.set('views', __dirname + '/views')

// Connect to database
mongoose.connect(config.database);

// Import Routing
require('./app/routes')(app);

// Initialize passport for use
app.use(passport.initialize());

// Bring in defined Passport Strategy
require('./config/passport')(passport);

// Log requests to console
app.use(morgan('dev'));

// Run the app
app.listen(port);
console.log('Server is up and running on port %s', port );
