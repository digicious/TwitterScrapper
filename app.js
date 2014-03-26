
var http = require('http');
var path = require('path');
var urlToScrape = 'timeline?q=test&src=typd&mode=photos&include_available_features=0&include_entities=0&last_note_ts=0';
var url = require('url');
var request = require('request-json');
var cheerio = require('cheerio');

var routes = require('./routes');
var users = require('./routes/user');
var utils = require('./utils.js');

var express=  require('express');
var swig = require('swig');
var app =express()
, server = require('http').createServer(app)
, io = require('socket.io').listen(server,{ log: false });

server.listen(8081);
app.engine('html', swig.renderFile);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.set('view cache', false);

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

var client = request.newClient('https://twitter.com/i/search/');
var intervalIds = [];
swig.setDefaults({ cache: false });
var lastWord = function(o) {
	return (""+o).replace(/[\s-]+$/,'').split(/[\s-]/).pop();
};
var intervalId  ;

var maxLevel = 3;
var keyword ="test";
function scrapUrl(url, nextPage)
{
	
	if(nextPage)
	{
		url += "&scroll_cursor=" + nextPage;
	}

	client.get(url, function(err, res, body) {
		nextPage = body.scroll_cursor;
		var $ = cheerio.load(body.items_html);
		console.log(url);
		console.log(keyword);
		$("span").each(function(){
			if(url.indexOf(keyword) != -1)
			{

				var val = $(this).attr("data-resolved-url-large");
				if(val )
				{
					io.sockets.emit("newImages",[val]);
				}
			}
			});
		return nextPage;
		});
}

io.sockets.on('connection', function (socket) {
	socket.on('giveMeMore', function (data) { 
		console.log("giveMeMoreCalled " + data);
		var url = urlToScrape.replace("test",data.keyword);
		if(data.nextPage)
		{
			url += "&scroll_cursor=" + data.nextPage;
		}
		client.get(url, function(err, res, body) {
				var $ = cheerio.load(body.items_html);
				var images = [];
				$("span").each(function(){
						var val = $(this).attr("data-resolved-url-large");
						if(val )
						{
							images.push(val);
						}
					});
				console.log("Pushing" + images.length);
				socket.emit("newImages", { 'keyword': data.keyword , 'nextPage':body.scroll_cursor , 'images': images});
			});
		});
	});

//console.log(urlArray);
app.get('/:q', function (req, res) {
	var i = 0;
	var nextPage = "";
	res.sendfile( path.join(__dirname,"public") + '/index.html');

});

/*
http.createServer(app).listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
});
*/
