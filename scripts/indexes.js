import DB from "../modules/db.js";
import dotenv from 'dotenv';

dotenv.config({ path: new URL('../.env', import.meta.url) });

const mongo = new DB();

(async()=>{
await mongo.client.db("meta").collection('users').createIndex({"email":1}, {unique:true})
mongo.client.close();
})();