var express = require('express'),
    request = require('request'),
    cheerio = require('cheerio'),
    cors    = require('cors'),
    fs      = require('fs'),
    path    = require('path'),
    CronJob = require('cron').CronJob;

var app = express();

var manga = express.Router();

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

manga.get('/all', cors(), function(req, res) {
    res.sendFile(path.join(__dirname + '/all.json'));
});
manga.get('/recent/:id', cors(), function(req, res) {
    request('http://mangafox.me/releases/' + req.params.id + '.htm', function(err, response, body) {

        var $ = cheerio.load(body);
        var links = $('#updates .series_preview');
        var list = [];

        for (var i = 0; i < links.length; i++) {
            var aElement = $(links[i]);

            var name = aElement.text();
            var link = aElement.attr('href');
            var manga_id = aElement.attr('rel');

            list.push({
                manga_id: manga_id,
                cover: 'http://a.mfcdn.net/store/manga/'+ manga_id +'/cover.jpg?',
                name: name,
                link: link
            });

        }
        res.send(list);
    });
});
manga.get('/hot/:id', cors(), function(req, res) {
    request('http://mangafox.me/directory/' + req.params.id + '.htm', function(err, response, body) {

        var $ = cheerio.load(body);
        var links = $('.manga_text .title');
        var list = [];

        for (var i = 0; i < links.length; i++) {
            var aElement = $(links[i]);

            var name = aElement.text();
            var link = aElement.attr('href');
            var manga_id = aElement.attr('rel');

            list.push({
                manga_id: manga_id,
                cover: 'http://a.mfcdn.net/store/manga/'+ manga_id +'/cover.jpg?',
                name: name,
                link: link
            });

        }
        res.send(list);
    });
});
manga.get('/new', cors(), function(req, res) {
    request('http://mangafox.me/directory/new/', function(err, response, body) {

        var $ = cheerio.load(body);
        var links = $('.manga_text .title');
        var list = [];

        for (var i = 0; i < links.length; i++) {
            var aElement = $(links[i]);

            var name = aElement.text();
            var link = aElement.attr('href');
            var manga_id = aElement.attr('rel');

            list.push({
                manga_id: manga_id,
                cover: 'http://a.mfcdn.net/store/manga/'+ manga_id +'/cover.jpg?',
                name: name,
                link: link
            });

        }
        res.send(list);
    });
});
manga.get('/show/:name', cors(), function(req, res) {
    request('http://mangafox.me/manga/' + req.params.name, function(err, response, body) {

        var $ = cheerio.load(body);
        var json = {
            name : undefined,
            summary: undefined,
            cover: undefined,
            status: undefined,
            volumes: []
        };

        $('#series_info').filter(function() {
            json.cover = $('.cover img').attr('src');
            json.status = $('.data span').text().split('\r\n')[1].trim();
        });

        $('#title').filter(function() {
            json.name = $('h1').text();
            json.summary = $('.summary').text();
        });

        $('#chapters').filter(function() {
            var volume_elms = $('.volume');
            var chapter_elms = $('.chlist');

            for (var i = 0, l = volume_elms.length; i < l; ++i) {
                var elm = $(volume_elms[i]);
                var celm = $(chapter_elms[i]);

                var volume_name = elm.first().text();
                var volume_id = elm.first().text().replace('olume', '').replace('Chapter', '').replace(' ', '').substring(1,4).trim();

                var vlist = {
                    id: volume_id,
                    name: volume_name,
                    chapters: []
                };

                for (var j = 0, ll = celm.children().length; j < ll; ++j) {
                    var chapter = $(celm.children()[j]);


                    var chapter_name = chapter.first().text().split('\r\n')[4].trim();
                    var chapter_id = chapter_name.split(' ')[chapter_name.split(' ').length-1];

                    vlist.chapters.push({
                        id: chapter_id,
                        name: chapter_name
                    });
                }

                json.volumes.push(vlist);
            }
        });

        res.send(json);
    });
});
manga.get('/read/:name/:volume/:chapter/:id', cors(), function(req, res) {
    var url = 'http://mangafox.me/manga/' + req.params.name + '/v' + req.params.volume + '/c' + req.params.chapter + '/' + req.params.id + '.html';
    request({ url: url, gzip: true }, function(err, response, body) {

        var $ = cheerio.load(body);
        var json = {
            name: undefined,
            title: undefined,
            image: undefined
        };

        $('#series').filter(function() {
            json.name = $('h1').text();
            json.title = $('strong a').text();
            json.image = $('#viewer img').attr('src');
        });

        res.send(json);
    });
});
app.use('/manga', manga);

new CronJob('0 * * * *', function() {
    request('http://mangafox.me/manga/', function(err, response, body) {
        var $ = cheerio.load(body);
        var links = $('.series_preview');
        var list = [];

        for (var i = 0; i < links.length; i++) {
            var aElement = $(links[i]);
            var name = aElement.text();
            var link = aElement.attr('href');
            var manga_id = aElement.attr('rel');

            list.push({
                name: name,
                link: link,
                manga_id: manga_id
            });
        }
        fs.writeFile('all.json', JSON.stringify(list, null, 4), function(){
            console.log('File successfully written!');
        });
    });
}, null, true, 'Asia/Tokyo');

app.listen(1337);
console.log('Running on 1337');
