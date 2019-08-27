'use strict';

//mongoose file must be loaded before all other files in order to provide
// models to other modules
var mongoose = require('./mongoose'),
  passport = require('passport'),
  express = require('express'),
  jwt = require('jsonwebtoken'),
  expressJwt = require('express-jwt'),
  router = express.Router(),
  cors = require('cors'),
  bodyParser = require('body-parser'),
  request = require('request'),
  Twit = require('twit');
var MongoClient =  require("mongodb").MongoClient;
var url = "mongodb://localhost/twitter-demo";

mongoose();

var User = require('mongoose').model('User');
var passportConfig = require('./passport');

//setup configuration for facebook login
passportConfig();

var app = express();
var config = require('./config')
var T = new Twit(config);
var params = {
q: 'http',
until:"2019-08-26",
count:'150',
lang:'en'
}

T.get('search/tweets', params,searchedData);
var tweetData;
var urlData;
 function searchedData(err, data, response) {
  tweetData = data;
  MongoClient.connect(url, function(err,db){
    console.log("connected ",data.statuses.length);
    for (var i = 1; i < data.statuses.length; i++) {
      if(data.statuses[i].text.indexOf("http") != -1){
        urlData = data;
        // console.log("Tweet with URL ",data.statuses[i].user);
        db.collection("Tweets").insert({
            Data : tweetData.statuses[i].text
          });

      }

  }
    console.log("stored tweets that contain urls");
    db.close();
  });
}


// enable cors
var corsOption = {
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['x-auth-token']
};
app.use(cors(corsOption));

//rest API requirements

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

router.route('/health-check').get(function(req, res) {
  res.status(200);
  res.send('Hello World');
});

var createToken = function(auth) {
  return jwt.sign({
    id: auth.id
  }, 'my-secret',
  {
    expiresIn: 60 * 120
  });
};

var generateToken = function (req, res, next) {
  req.token = createToken(req.auth);
  return next();
};

var sendToken = function (req, res) {
  res.setHeader('x-auth-token', req.token);
  return res.status(200).send(JSON.stringify(req.user));
};

router.route('/auth/twitter/reverse')
  .post(function(req, res) {
    request.post({
      url: 'https://api.twitter.com/oauth/request_token',
      oauth: {
        oauth_callback: "http%3A%2F%2Flocalhost%3A3000%2Ftwitter-callback",
        consumer_key: "yOjZvadKJv0nPszvJBBY9b9G2",
        consumer_secret: "HlWRPCPN1isXVTw5uJm0uQjkev7gqdKliXFkP4ZTMA7erg8wy9"
      }
    }, function (err, r, body) {
      if (err) {
        return res.send(500, { message: e.message });
      }

      var jsonStr = '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
      console.log("string is ",jsonStr);
      res.send(JSON.parse(jsonStr));
    });
  });

router.route('/auth/twitter')
  .post((req, res, next) => {
    request.post({
      url: `https://api.twitter.com/oauth/access_token?oauth_verifier`,
      oauth: {
        consumer_key: "yOjZvadKJv0nPszvJBBY9b9G2",
        consumer_secret: "HlWRPCPN1isXVTw5uJm0uQjkev7gqdKliXFkP4ZTMA7erg8wy9",
        token: req.query.oauth_token
      },
      form: { oauth_verifier: req.query.oauth_verifier }
    }, function (err, r, body) {
      if (err) {
        return res.send(500, { message: err.message });
      }

      const bodyString = '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
      const parsedBody = JSON.parse(bodyString);

      req.body['oauth_token'] = parsedBody.oauth_token;
      req.body['oauth_token_secret'] = parsedBody.oauth_token_secret;
      req.body['user_id'] = parsedBody.user_id;

      next();
    });
  }, passport.authenticate('twitter-token', {session: false}), function(req, res, next) {
      if (!req.user) {
        return res.send(401, 'User Not Authenticated');
      }

      // prepare token for API
      req.auth = {
        id: req.user.id
      };

      return next();
    }, generateToken, sendToken);

app.get("/searchByHashTag", (req,res) => {
  console.log("requested.... ",req.query["key"]);
  var dataHash = [];
  for (var i = 1; i < urlData.statuses.length; i++) {
    console.log("URL ",urlData.statuses[i].text);
    if(urlData.statuses[i].text.includes(req.query["key"])){
      console.log("HASH ",urlData.statuses[i].text);
      dataHash.push(urlData.statuses[i].text);
    }
  }
  res.send(dataHash);
});

app.get("/searchByLocation", (req,res) => {
  console.log("requested.... ",req.query["key"]);
  var dataLoc = [];
  for (var i = 1; i < urlData.statuses.length; i++) {
    console.log("URL ",urlData.statuses[i]);
    if(urlData.statuses[i].user.location.includes(req.query["key"])){
      console.log("HASH ",urlData.statuses[i].user.location);
      dataLoc.push(urlData.statuses[i].user.location);
    }
  }
  res.send(dataLoc);
});




app.use('/api/v1', router);

app.listen(4000);
module.exports = app;

console.log('Server running at http://localhost:4000/');
