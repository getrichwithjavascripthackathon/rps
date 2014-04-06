var express   = require('express');
var webserver = express();
var config = require('./config.json');
var credentials = require('./credentials.json');

var webserverPort = config.webserver.port;
webserver.configure(function() {
	webserver.use(express.static(__dirname + '/public'));
	webserver.use(express.logger('dev'));
});

webserver.get("/matches.json", function(req, res) {
    res.send([
      {name: "Rockman", lat: 37.7619029, lng: -122.4151263},
      {name: "Papercutter", lat: 37.7602744, lng: -122.4101267}
    ])
})
webserver.listen(webserverPort);
console.log("RPSing on port http://localhost:" + webserverPort);

// === send email test

var nodemailer = require('nodemailer');
var os = require("os");
var transport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: credentials.gmail.user,
        pass: credentials.gmail.password
    }
});

var mailOptions = {
    from: "RPS Hackathon ✔ <" + credentials.gmail.user + ">",
    to: "gruen0aermel@gmail.com",
    subject: "Hello ✔",
    text: "Hello world ✔ from " + os.hostname() + " (" + os.platform() + ")"
}

console.log("Sending test email to " + mailOptions.to);
transport.sendMail(mailOptions, function(error, response){
    if(error){
        console.log(error);
    }else{
        console.log("Message sent: " + response.message);
    }

    transport.close();
});
