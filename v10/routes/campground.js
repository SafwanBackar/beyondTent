var express = require('express')
var router = express.Router();
var Campground = require('../models/campground')
var middleware = require('../middleware')


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
router.post('/', middleware.isLoggedIn, function (req, res) {
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

router.get('/new', middleware.isLoggedIn, function (req, res) {
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

// Edit Campground
router.get('/:id/edit', middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampground) {
        res.render('campgrounds/edit', { campground: foundCampground })
    })
})

// Update Campground
router.put('/:id', middleware.checkCampgroundOwnership, function (req, res) {
    // Find and update the campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, updatedCampground) {
        if (err) {
            res.redirect('/campgrounds')
            console.log(err)
        } else {
            res.redirect('/campgrounds/' + req.params.id)
        }

    })
    // Redirect to other page
})

// Delete Campground
router.delete('/:id', middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findByIdAndDelete(req.params.id, function (err) {
        if (err) {
            res.redirect('/campgrounds')
        } else {
            res.redirect('/campgrounds')
        }
    })
})


module.exports = router