import mongoose from "mongoose"

export default class MongoContainer{
    constructor(collectionName, schema){
        this.collection = mongoose.model(collectionName, schema)
    }
    async getAll(){
        try {
            let response = await this.collection.find({})
            return response
        } catch (error) {
            throw new Error(error.message)
        }
    }
    async getById(id){
        try {
            let response = await this.collection.find({_id : id})
        return response
        } catch (error) {
            throw new Error(error.message)
        }
    }
    async deleteById(id){
        try {
            await this.collection.deleteOne({_id : id})
        } catch (error) {
            throw new Error(error.message)
        }
    }
    async save(product){
        try {
            let response = this.collection.create(product)
            return response
        } catch (error) {
            throw new Error(error.message)
        }
    }
}
