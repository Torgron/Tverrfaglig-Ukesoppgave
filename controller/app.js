//Her bruker jeg node funksjonen require() for å laste inn nødvendige node moduler
const dotenv = require("dotenv");
dotenv.config({ path: '../.env' });
const express = require("express");
const passport = require("passport");
const GoogleStrategy = require( "passport-google-oauth2" ).Strategy;
const favicon = require("serve-favicon");

//Her lages en ny express applikasjon ved å tildele express() funksjonen til en variabel
const app = express();

//Her settes EJS som view engine for express applikasjonen
app.set("view engine", "ejs");

//Her blir det lagt til middleware for å gjøre det mulig å få tilgang til filer i denne mappen via HTTP
app.set("views", "../views");
app.use(express.static("views"));

//Her blir det lastet inn et HTTP-rammeverk som brukes for å lagre brukerdata mellom HTTP-forespørsler
const session = require("express-session");

//Her brukes express.static() igjen for å kunne nå filene i de valgte mappene via den første stien
app.use("/styles", express.static("../views/styles"));
app.use("/css", express.static("../node_modules/bootstrap/dist/css"));
app.use("/js", express.static("../node_modules/bootstrap/dist/js"));
app.use("/js", express.static("../node_modules/jquery/dist"));
app.use(favicon("../views/images/favicon.ico"));


//Passport er autentiseringsmiddleware for Node.js. GoogleStrategy er en måte for Passport å autentisere med Google. 
passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    passReqToCallback   : true
    },
    function(request, accessToken, refreshToken, profile, done) {
        return done(null, profile);
    }
));


//Her blir brukeren lagret og det blir bestemt hva slags brukerdata som skal bli lagret i økten
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


//Her sjekkes det om brukeren er logget inn, hvis ikke vil brukeren blir sendt til "/" routen
function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect("/");
    }
}


//Her blir GET og POST forespørsler håndtert og bruker blir sendt til de forskjellige sidene samt det testes om brukeren er autentisert
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


//Her er porten serveren kjører på

const PORT = process.env.PORT || 8080;

app.listen(PORT, function(){
    console.log("Server is running on port 8080.");
});