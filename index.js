const express = require("express");

const app = express();

app.get("/", function(req, res){
    res.sendFile(__dirname + "/index.html");
});

app.listen(process.env.PORT || 8080, function(){
    console.log("Server is running on port 8080.");
});