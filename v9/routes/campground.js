var express = require('express')
var router = express.Router();
var Campground = require('../models/campground')


// Index - Show all campgrounds

router.get('/', function (req, res) {
    Campground.find({}, function (err, allCampgrounds) {
        if (err) {
            console.log(err)
        } else {
            res.render('campgrounds/index', { campgrounds: allCampgrounds, currentUser: req.user })
        }
    })

});

// Add new campground to DB
router.post('/', isLoggedIn, function (req, res) {
    var name = req.body.name
    var image = req.body.image
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = { name: name, image: image, description: desc, author: author }
    Campground.create(newCampground, function (err, newlyCreated) {
        if (err) {
            console.log(err)
        } else {
            res.redirect('/campgrounds')
        }
    })
})


// New - show form to create new campground

router.get('/new', isLoggedIn, function (req, res) {
    res.render('campgrounds/new')
})

// Show Route
router.get('/:id', function (req, res) {
    Campground.findById(req.params.id).populate('comments').exec(function (err, foundCampgroud) {
        if (err) {
            console.log(err)
        } else {
            res.render('campgrounds/show', { campground: foundCampgroud });
        }
    })
})

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login')
}

module.exports = router