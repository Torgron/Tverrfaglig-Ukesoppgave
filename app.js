require("dotenv").config();
const express = require("express");
const passport = require("passport");
var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

const app = express();

app.set('view engine', 'ejs');

app.use(express.static("Public"));

const session = require("express-session");
const { redirect } = require("express/lib/response");

passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    passReqToCallback   : true
    },
    function(request, accessToken, refreshToken, profile, done) {
        return done(null, profile);
    }
));

app.use(session ({
    resave: false, 
    saveUnitialized: true, 
    secret: "secret"
}));

passport.serializeUser(function(user, cb) {
    cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
});

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
    res.render("index");
});

app.post("/", (req, res) => {
    res.redirect("/auth/google");
});

app.get("/auth/google",
    passport.authenticate("google", { scope:
    [ "email", "profile" ] }
));

app.get("/auth/google/callback",
    passport.authenticate( "google", {
        successRedirect: "/auth/google/success",
        failureRedirect: "/auth/google/failure"
}));

app.get("/auth/google/success", (req, res) => {
    res.render("success")
});

app.post("/auth/google/success", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});


const PORT = process.env.PORT || 8080;

app.listen(PORT, function(){
    console.log("Server is running on port 8080.");
});