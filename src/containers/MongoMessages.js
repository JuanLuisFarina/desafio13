import { messageModelName, messageSchema } from "./config/schemaConfig.js";
import MongoContainer from "./MongoContainer.js";

export default class MongoMessages extends MongoContainer{
    constructor(){
        super(messageModelName, messageSchema)
    }
}
