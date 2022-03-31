var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    Campground = require('./models/campground'),
    Comment = require('./models/comment'),
    User = require('./models/user'),
    seedDB = require('./views/seed')



mongoose.connect('mongodb://localhost/yelp_camp_v5');
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))
seedDB();

// Passport Configuration
app.use(require('express-session')({
    secret: 'Once again here i',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use(function (req, res, next) {
    res.locals.currentUser = req.user
    next();
})



app.get('/', function (req, res) {
    res.render('landing')
})

// Index - Show all campgrounds

app.get('/campgrounds', function (req, res) {
    Campground.find({}, function (err, allCampgrounds) {
        if (err) {
            console.log(err)
        } else {
            res.render('campgrounds/index', { campgrounds: allCampgrounds, currentUser: req.user })
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


// New - show form to create new campground
app.get('/campgrounds/new', function (req, res) {
    res.render('campgrounds/new')
})

// Show Route
app.get('/campgrounds/:id', function (req, res) {
    Campground.findById(req.params.id).populate('comments').exec(function (err, foundCampgroud) {
        if (err) {
            console.log(err)
        } else {
            res.render('campgrounds/show', { campground: foundCampgroud });
        }
    })
})

// Comments Route

app.get('/campgrounds/:id/comments/new', isLoggedIn, function (req, res) {
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            // console.log(req.params.id);
            console.log(err)
        } else {
            res.render('comments/new', { campground: campground })
        }
    })
})

app.post('/campgrounds/:id/comments', isLoggedIn, function (req, res) {
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err)
            res.redirect('/campgrounds')
        } else {
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    console.log(err)
                } else {
                    campground.comments.push(comment)
                    campground.save();
                    res.redirect('/campgrounds/' + campground._id);
                }
            })
        }
    })
})

// Auth Routes

app.get('/register', function (req, res) {
    res.render('register')
})

app.post('/register', function (req, res) {
    var newUser = new User({ username: req.body.username })
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render('register')
        }
        passport.authenticate('local')(req, res, function () {
            res.redirect('/campgrounds')
        })
    })
})


app.get('/login', function (req, res) {
    res.render('login')
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/campgrounds',
    failureRedirect: '/login'
}), function (req, res) {
})

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/campgrounds')
})

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login')
}

app.listen(3000, function () {
    console.log('Server has started')
})