var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var passport = require('passport');
var config = require('./config/database');
var User = require('./app/models/user');
var jwt = require('jwt-simple');
var app = express();
var port = config.port;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use(morgan('dev'));

app.use(passport.initialize());

app.get('/', function (req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});

mongoose.connect(config.database, function (err, dbConn) {
    if(err){
        console.log('Unable to connect to db');
    } else {
        console.log('Connected to db successfully');
    }
});

require('./config/passport')(passport);

var apiRoutes = express.Router();

apiRoutes.post('/signup', function (req, res) {
    if(!req.body.name || !req.body.password){
        res.json({success: false, msg: 'Please pass name and password.'});
    } else {
        var newUser = new User({
            name: req.body.name,
            password: req.body.password
        });

        newUser.save(function (err) {
            if(err){
                return res.json({success: false, msg: 'Username already exists.'});
            } else {
                res.json({success: true, msg: 'Successfully created new user.'});
            }
        });
    }
});

apiRoutes.post('/authenticate', function (req, res) {
    User.findOne({
        name: req.body.name
    }, function (err, user) {
        if (err){
            throw err;
        } else if(!user){
            res.send({success: false, msg: 'Authentication failed. User not found.'});
        } else {
            user.comparePassword(req.body.password, function (err, isMatch) {
                if(isMatch && !err){
                    var token = jwt.encode(user, config.secret);
                    res.json({success: true, token: 'JWT ' + token});
                } else {
                    res.send({success: false, msg: 'Authentication failed. Wrong password.'});
                }
            });
        }
    });
});

apiRoutes.get('/memberinfo', passport.authenticate('jwt', {session: false}), function (req, res) {
    var token = getToken(req.headers);
    if(token){
        var decoded = jwt.decode(token, config.secret);
        User.findOne({name: decoded.name}, function (err, user) {
            if (err) {
                throw err;
            } else if(!user){
                return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
            } else {
                res.json({success: true, msg: 'Welcome in the member area ' + user.name + '!'});
            }
        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided'});
    }
});

var getToken = function (headers) {
    if(headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if(parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};

app.use('/api', apiRoutes);

app.listen(port);
console.log('App will be running at http://localhost:' + port);
