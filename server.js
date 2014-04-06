var express   = require('express');
var webserver = express();
var credentials = {
  gmail: {
    user: process.env.GMAIL__USER,
    password: process.env.GMAIL__PASSWORD
  }
};

var webserverPort = process.env.PORT || 9400;
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


var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOHQ_URL || 'mongodb://localhost/rps_dev');


var User = mongoose.model('User', {
	name : String,
  score: Number,
  wins: Number,
  losses: Number,
  position: { lat: Number, lon: Number }
});

var rockman = new User({name: "RockMAN", score: 0, wins: 0, losses: 0});

rockman.save(function (err, rockman) {
  if (err) return console.error(err);
});
