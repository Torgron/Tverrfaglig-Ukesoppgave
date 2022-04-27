const dotenv = require("dotenv");
dotenv.config({ path: '../.env' });
const express = require("express");
const passport = require("passport");
const GoogleStrategy = require( "passport-google-oauth2" ).Strategy;
const favicon = require("serve-favicon");

const app = express();

app.set("view engine", "ejs");

app.set("views", "../views");
app.use(express.static("views"));

const session = require("express-session");

app.use("/styles", express.static("../views/styles"));
app.use("/css", express.static("../node_modules/bootstrap/dist/css"));
app.use("/js", express.static("../node_modules/bootstrap/dist/js"));
app.use("/js", express.static("../node_modules/jquery/dist"));
app.use(favicon("./favicon.ico"));

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
    saveUninitialized: true, 
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

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect("/");
    }
}

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
        failureRedirect: "/"
}));

app.get("/auth/google/success", loggedIn, (req, res) => {
    res.render("success", {displayName: req.user.displayName});
});

app.post("/auth/google/success", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

app.get("/auth/google/success/security", loggedIn, (req, res) => {
    res.render("security");
});

app.post("/auth/google/success/security", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});


const PORT = process.env.PORT || 8080;

app.listen(PORT, function(){
    console.log("Server is running on port 8080.");
});