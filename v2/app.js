var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/yelp_camp');
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

//Schema Setup
var campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String
});

var Campground = mongoose.model('Campground', campgroundSchema);

app.get('/', function (req, res) {
    res.render('landing')
})


app.get('/campgrounds', function (req, res) {
    Campground.find({}, function (err, allCampgrounds) {
        if (err) {
            console.log(err)
        } else {
            res.render('index', { campgrounds: allCampgrounds })
        }
    })

});


app.post('/campgrounds', function (req, res) {
    var name = req.body.name
    var image = req.body.image
    var desc = req.body.description;
    var newCampground = { name: name, image: image, description: desc }
    Campground.create(newCampground, function (err, newlyCreated) {
        if (err) {
            console.log(err)
        } else {
            res.redirect('/campgrounds')
        }
    })
})

app.get('/campgrounds/new', function (req, res) {
    res.render('new.ejs')
})

app.get('/campgrounds/:id', function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampgroud) {
        if (err) {
            console.log(err)
        } else {
            res.render('show', { campground: foundCampgroud });
        }

    })
})

app.listen(3000, function () {
    console.log('Server has started')
})