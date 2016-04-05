var express = require("express");
var app = express();

app.use('/resources',express.static('resources'));
app.use('/app',express.static('app'));
app.use('/ext',express.static('ext'));
app.use('/desktop',express.static('desktop'));
app.use('/app.js',express.static(__dirname + '/app.js'));
app.use('/app.json',express.static(__dirname + '/app.json'));
app.use('/bootstrap.js',express.static(__dirname + '/bootstrap.js'));
app.use('/bootstrap.json',express.static(__dirname + '/bootstrap.json'));
app.use('/bootstrap.css',express.static(__dirname + '/bootstrap.css'));

app.get("/",function(req,res){
	res.sendFile(__dirname+"/"+"index.html");
});

var server = app.listen(3000,function(){
	var host = server.address().address;
	var port = server.address().port;
	
	console.log("Web Desktop App Listening at http://%s:%s Created by Eko Junaidi Salam",host,port);
})
