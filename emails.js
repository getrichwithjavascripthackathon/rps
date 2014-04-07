var credentials = {
  gmail: {
    user: process.env.GMAIL__USER,
    password: process.env.GMAIL__PASSWORD
  }
};

var nodemailer = require('nodemailer');
exports.sendMatchEmail = function(p1,p2){
	var transport = nodemailer.createTransport("SMTP",{
	    service: "Gmail",
	    auth: {
	        user: credentials.gmail.user,
	        pass: credentials.gmail.password
	    }
	});
	console.log(p1);
	console.log(p2);
	var mailOptions = {
	    from: "RPS Hackathon ✔ <" + credentials.gmail.user + ">",
	    bcc: [p1.email, p2.email],
	    subject: p1.name + " vs. " + p2.name,
	    text: "ROUND 1: FIGHT!"
	}

	console.log("Sending REAL email to " + mailOptions.bcc);
	transport.sendMail(mailOptions, function(error, response){
	    if(error){
	        console.log(error);
	    }else{
	        console.log("Message sent: " + response.message);
	    }

	    transport.close();
	});
}