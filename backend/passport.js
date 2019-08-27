'use strict';

var passport = require('passport'),
  TwitterTokenStrategy = require('passport-twitter-token'),
  User = require('mongoose').model('User');

module.exports = function () {

  passport.use(new TwitterTokenStrategy({
      consumerKey: "yOjZvadKJv0nPszvJBBY9b9G2",
      consumerSecret: "HlWRPCPN1isXVTw5uJm0uQjkev7gqdKliXFkP4ZTMA7erg8wy9",
      includeEmail: true
    },
    function (token, tokenSecret, profile, done) {
      User.upsertTwitterUser(token, tokenSecret, profile, function(err, user) {
        return done(err, user);
      });
    }));

};
