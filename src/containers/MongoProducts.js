import { productModelName, productSchema } from './config/schemaConfig.js';
import MongoContainer from './MongoContainer.js';

export default class MongoProducts extends MongoContainer{
    constructor(){
        super(productModelName, productSchema)
    }
    async updateProduct(product, productId){
        try {
            let response = this.collection.updateOne({_id : productId}, product)
            return response
        } catch (error) {
            throw new Error(error.message)
        }
    }
}
