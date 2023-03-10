import mongoose from 'mongoose';

const productModelName = "products";

const productSchema = new mongoose.Schema({
    id : {type : Number, required : true},
    name : {type : String, required : true},
    price : {type : Number, required : true},
    src : {type : String, required : true}
})

const messageModelName = "messages"

const messageSchema = new mongoose.Schema({
    date : {type : String, required : true},
    mail : {type : String, required : true},
    text : {type : String, required : true}
})

export {productModelName, productSchema, messageModelName, messageSchema}