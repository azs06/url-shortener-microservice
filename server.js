'use strict';

require('dotenv').config();

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { Url } = require('./models/Url')
const { makeid, validURL } = require('./util/index');

var cors = require('cors');

var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGO_URI);

const db = mongoose.connection;

db.on('error', error => console.error(`connection error: ${error}`));
db.on('open', () => console.log(`db connection successful`));

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});
 
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.post('/api/shorturl/new', function(req, res, next){
  const userUrl = req.body.url.toLowerCase();
  const shortCut = makeid(5);
  if(validURL(userUrl)){
    const shortUrl = new Url({original_url: userUrl, short_url: shortCut});
    Url.findOne({original_url: userUrl}, (err, doc) => {
      if(err) next(err)
      if(doc) {
        return res.status(201).json({original_url: doc.original_url, short_url: doc.short_url})
      }
      shortUrl.save((err, doc) => {
        if(err) next(err)
        return res.status(201).json({original_url: doc.original_url, short_url: doc.short_url})
      })
    })
  }else{
    return res.json({error: 'Invalid URL'});
  }
  
});

app.get("/api/shorturl/:shortcut", function (req, res) {
  const shortCut = req.params.shortcut
  Url.findOne({short_url: shortCut}, (err, doc) => {
    if(err) next(err)
    if(doc) {
      return res.redirect(doc.original_url);
    }
    return res.status(201).json({ error: "No short URL found for the given input" })
  })
});

app.listen(port, function () {
  console.log('Node.js listening ...', port);
});