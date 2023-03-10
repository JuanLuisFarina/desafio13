import express from "express";
import * as handlebars from 'express-handlebars'
import session from "express-session";

import passport from "passport";
import { Strategy as LocalStrategy} from "passport-local";
import { Strategy as TwitterStrategy } from "passport-twitter";
import User from "./models/models.js";

import MongoStore from "connect-mongo";
import MongoMessages from "./containers/MongoMessages.js";
import MongoProducts from "./containers/MongoProducts.js";
import mongoose from "mongoose";

import { Server as IOServer } from "socket.io";
import { Server as HttpServer } from 'http';

import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

import {getLogIn, getLogOut, getFailedLogIn, getSignUp, getFailedSignUp, getHome, postLogin, postSignup, getInfo} from './routes/routes.js'

import { createHash, isValidPassword } from './helpers/functions.js';
import config from "./helpers/config.js";


import { fork } from "child_process";


try {
    mongoose.connect(config.MONGO.connection, config.MONGO.options)
} catch (error) {
    console.log('Not connected to Mongodb Atlas.')
    console.log(error)
}
const productos = new MongoProducts
const mensajes = new MongoMessages

const app = express()


const __dirname = dirname(fileURLToPath(import.meta.url));
const hbs = handlebars.create({
    layoutsDir: path.join(__dirname, '../public/views/layouts'),
    extname : 'hbs'
})


export const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)


passport.use(new TwitterStrategy({
    consumerKey: config.TWITTER_CONSUMER_KEY,
    consumerSecret: config.TWITTER_CONSUMER_SECRET,
    callbackURL: '/auth/twitter/callback'
}, (token, tokenSecret, userProfile, done) => {
    return done(null, userProfile)
}));
    
passport.use('signup', new LocalStrategy({
    passReqToCallback: true
},
    (req, username, password, done) => {
        User.findOne({ 'username': username }, (err, user) => {
            if (err) {
                return done(err);
            };

            if (user) {
                return done(null, false);
            }

            const newUser = {
                username: username,
                password: createHash(password),
                email: req.body.email,
                firstName: req.body.firstName,
                lastName: req.body.lastName
            };

            User.create(newUser, (err, userWithId) => {
                if (err) {
                    return done(err);
                }
                return done(null, userWithId);
            })
        });
    }
));
passport.use('login', new LocalStrategy(
    (username, password, done) => {
        User.findOne({ username }, (err, user) => {
            if (err) {
                return done(err);
            }

            if (!user) {
                return done(null, false);
            }

            if (!isValidPassword(user, password)) {
                return done(null, false);
            }

            return done(null, user);
        })
    }
));
passport.serializeUser((user, callback)=> {
    callback(null, user);
});
passport.deserializeUser((user, callback)=> {
    if(user._id){
        User.findById(user._id, callback)
    }
    else{callback(null, user)}
});

app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine);
app.set('views', path.join(__dirname, '../public/views'))
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    store : MongoStore.create({
        mongoUrl : 'mongodb+srv://admin:D4Z3hFdGnvWTasOm@techwearclubar.xtw4azf.mongodb.net/sessions?retryWrites=true&w=majority',
        mongoOptions : {useNewUrlParser : true, useUnifiedTopology: true}
    }),
    secret : 'secret',
    resave : false, 
    saveUninitialized : false,
    rolling: true,
    cookie : {maxAge : config.EXP_TIME}
}))

app.use(passport.initialize());
app.use(passport.session())





app.get('/', getLogIn)
app.get('/login', getLogIn)
app.post('/login', passport.authenticate('login', {failureRedirect:'/faillogin'}), postLogin)
app.get('/faillogin', getFailedLogIn)

app.get('/signup', getSignUp)
app.post('/signup', passport.authenticate('signup', {failureRedirect:'/failsignup'}), postSignup)
app.get('/failsignup', getFailedSignUp)

app.get('/logout', getLogOut)

app.get('/home', getHome)


app.get('/auth/twitter', passport.authenticate('twitter'))
app.get('/auth/twitter/callback', passport.authenticate('twitter', {
    successRedirect: '/',
    failureRedirect: '/faillogin'
}))

app.get('/info', getInfo)




const {Router} = express;
const routerRandom = new Router();
routerRandom.use(express.json());
routerRandom.use(express.urlencoded({extended: true}))
routerRandom.get('/', (req, res) => {
    const n = parseInt(req.query.cant) ? parseInt(req.query.cant) : 500000
    console.log(n)
    const forked = fork('./src/helpers/randomsFork.js')
    forked.on('message', message => {
        res.json(message)
    })
    setTimeout(() => {forked.send(n)}, 2000)
})
app.use('/api/randoms', routerRandom)


io.on('connection', async socket => {
    const products = await productos.getAll();
    const messages = await mensajes.getAll();
    socket.emit('update_products', products);
    socket.emit('update_messages', messages);
    socket.on('new_product', async product => {
        product = await productos.save(product)
        products.push(product)
        io.sockets.emit('update_products', products)
    })
    socket.on('new_message', async message => {
        messages.push(message)
        await mensajes.save(message)
        io.sockets.emit('update_messages', messages)
    })
})