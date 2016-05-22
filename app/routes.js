// Import dependencies
var passport = require('passport');
var express = require('express');
var config = require('../config/main');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');


// Load models
var User = require('./models/user');

// Export the routes for our app to use
module.exports = function(app) {

  // Initialize passport for use
  app.use(passport.initialize());

  // Use body-parser to get POST requests for API use
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  // Bring in defined Passport Strategy
  require('../config/passport')(passport);

  // Create API group routes
  var apiRoutes = express.Router();

  // Home route.
  app.get('/', function(req, res) {
    res.send('home page');
  });

  // Login Form
  app.get('/login', function(req, res) {
    res.render('login');
  });

  // Register new users
  apiRoutes.post('/register', function(req, res) {
    if(!req.body.email || !req.body.password) {
      res.json({ success: false, message: 'Please enter email and password.' });
    } else {
      var newUser = new User({
        email: req.body.email,
        password: req.body.password,
        role: req.body.role
      });

      // Attempt to save the user
      newUser.save(function(err) {
        if (err) {
          return res.json({ success: false, message: 'That email address already exists.'});
        }
        res.json({ success: true, message: 'Successfully created new user.' });
      });
    }
  });

  // Authenticate the user and get a JSON Web Token to include in the header of future requests.
  apiRoutes.post('/authenticate', function(req, res) {
    console.log(req.body);
      if(!req.body){
        res.send('falló');
      }
    User.findOne({
      email: req.body.email
    }, function(err, user) {
      if (err) throw err;

      if (!user) {
        res.send({ success: false, message: 'Authentication failed. User not found.' });
      } else {
        // Check if password matches
        user.comparePassword(req.body.password, function(err, isMatch) {
          if (isMatch && !err) {
            // Create token if the password matched and no error was thrown
            var token = jwt.sign(user, config.secret, {
              expiresIn: 100000 // in seconds
            });
            res.json({ success: true, token: 'JWT ' + token });
          } else {
            res.send({ success: false, message: 'Authentication failed. Passwords did not match.' });
          }
        });
      }
    });
  });

  apiRoutes.post('/test', function(req, res) {
    res.send(req.body);
  })

  // Protect dashboard route with JWT
  apiRoutes.get('/dashboard', passport.authenticate('jwt', { session: false }), function(req, res) {
    res.send('It worked! User id is: ' + req.user._id + '.');
  });

  // Set url for API group routes
  app.use('/api', apiRoutes);
};
