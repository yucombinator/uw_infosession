var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var marked = require('marked');
var moment = require('moment');
fs = require('fs');

//ENABLE CORS
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });

app.get('/', function(req, res){
    fs.readFile('README.md', {encoding: 'utf-8'}, function(err,data){
        if (!err){
            res.send(marked(data));
        }else{
            console.log(err);
        }

    });
    //res.sendfile('README.md');
    //res.send(fs.readFile('README.md'));
    //marked();
})
app.get('/api/calendar', function(req, res){
	
	url = 'http://www.ceca.uwaterloo.ca/students/sessions.php';

	request(url, function(error, response, html){
		if(!error){
			var $ = cheerio.load(html);

			var company;
            //var link;
			var json = [];
            
			$('a[onmouseover]').each(function(i,elem){
		        var data = $(this);
		        company = data.text();//data.children().first().text();     
                //console.log(data);
                link = data.attr('href');//children().last().children().text();
                var thisJson = { company : "", link : "", id:"",info:""};
		        thisJson.company = company;
                thisJson.link = link;
                thisJson.id = link.match(/=(.+)/)[1];
                //thisJson.info = getEventDetails(thisJson.id);
                json.push(thisJson);
	        })
		}
        // To write to the system we will use the built in 'fs' library.
        // In this example we will pass 3 parameters to the writeFile function
        // Parameter 1 :  output.json - this is what the created filename will be called
        // Parameter 2 :  JSON.stringify(json, null, 4) - the data to write, here we do an extra step by calling JSON.stringify to make our JSON easier to read
        // Parameter 3 :  callback function - a callback function to let us know the status of our function

  /*      fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){

        	console.log('File successfully written! - Check your project directory for the output.json file');

        }) */

        // Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
        res.send(json);
	})
});

app.get('/api/calendar/:year/:month', function(req, res){
	
	url = 'http://www.ceca.uwaterloo.ca/students/sessions.php?month_num='+req.param("month")+'&year_num='+req.param("year");

	request(url, function(error, response, html){
		if(!error){
			var $ = cheerio.load(html);

			var company;
            //var link;
			var json = [];
            
			$('a[onmouseover]').each(function(i,elem){
		        var data = $(this);
		        company = data.text();//data.children().first().text();            
                link = data.attr('href');//children().last().children().text();
                var thisJson = { company : "", link : "", id:"",info:""};
		        thisJson.company = company;
                thisJson.link = link;
                thisJson.id = link.match(/=(.+)/)[1];
                //thisJson.info = getEventDetails(thisJson.id);
                json.push(thisJson);
	        })
		}
        // To write to the system we will use the built in 'fs' library.
        // In this example we will pass 3 parameters to the writeFile function
        // Parameter 1 :  output.json - this is what the created filename will be called
        // Parameter 2 :  JSON.stringify(json, null, 4) - the data to write, here we do an extra step by calling JSON.stringify to make our JSON easier to read
        // Parameter 3 :  callback function - a callback function to let us know the status of our function

       /* fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){

        	console.log('File successfully written! - Check your project directory for the output.json file');

        }) */

        // Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
        res.send(json);
	})
});


app.get('/api/event/:id', function(req, res){
    
    var id = req.param("id");
    console.log("Scraping: " + url);
    
    url_part = 'http://www.ceca.uwaterloo.ca/students/sessions_details.php?id=';
    url = url_part + id;

    request(url, function(error, response, html){
        if(!error){
            var $ = cheerio.load(html);

            var company,datetime,location,descrption,rsvplink,programs;
            //var link;
            var json = {company: "",date: "",time: "",location: "",descrption: "",rsvplink: "",programs: "",website: ""};

            $('#tableform').filter(function(){
                var data = $(this);
                //company = data.text;//data.children().first().text();            
                //link = data.attr('href');//children().last().children().text();
                //thisJson.company = company;
                //console.log(data.children().length);

                json.company = data.children().first().children().eq(1).text();
                var date = data.children().eq(1).children().eq(1).text();
                json.date = date;
                json.datetime = moment(date, "MMM D, YYYY", "en"); //TODO add time as well
                json.time = data.children().eq(2).children().eq(1).text();

                json.location = data.children().eq(3).children().eq(1).text();

                json.website = data.children().eq(4).children().eq(1).text();
                json.programs = data.children().eq(5).children().eq(0).text();

                json.description = data.children().eq(6).children().eq(0).text();
                json.rsvplink = "https://info.uwaterloo.ca/infocecs/students/rsvp/index.php?id="+id+"&mode=on";

            })
        }
        res.send(json);
    });
});

app.listen(process.env.PORT||8085);
console.log('Magic happens on port'+ process.env.port);
exports = module.exports = app;
