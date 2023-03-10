import dotenv from 'dotenv';
dotenv.config();

import parseArgs from 'minimist';
const options = {default : {port : 8080}};
const args = parseArgs(process.argv.slice(2), options);
const EXP_TIME = 200000;
const PORT = args.port ? args.port : 8080;
const MODO = args.mode ? args.mode : 'fork';
const DATABASE_URL = process.env.DATABASE_URL
const MONGO = {
    connection: DATABASE_URL,
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
};
const TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
const TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;

export default {
    EXP_TIME, 
    DATABASE_URL, 
    MONGO, 
    TWITTER_CONSUMER_KEY, 
    TWITTER_CONSUMER_SECRET, 
    PORT, 
    MODO
}