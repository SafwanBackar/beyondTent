var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    Campground = require('./models/campground'),
    Comment = require('./models/comment'),
    User = require('./models/user'),
    seedDB = require('./views/seed'),
    methodOverride = require('method-override'),
    flash = require('connect-flash')

var campgroundRoute = require('./routes/campground'),
    commentRoute = require('./routes/comment'),
    authRoute = require('./routes/auth')



mongoose.connect('mongodb://localhost/yelp_camp_v11');
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))
app.use(methodOverride('_method'))
app.use(flash())
// seedDB();

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
    res.locals.error = req.flash('error')
    res.locals.success = req.flash('success')
    next();
})

app.use('/', authRoute)
app.use('/campgrounds', campgroundRoute)
app.use('/campgrounds/:id/comments', commentRoute)



app.listen(3000, function () {
    console.log('Server has started')
})