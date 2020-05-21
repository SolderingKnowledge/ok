const mongoose = require("mongoose");//to connect
 
const config = require('config');// this package will get values from other files without importing it;
const db = config.get("mongoSRV");// like this fashion and global variable

const connectDB = async () => {
    try{
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
        console.log(`Atlas connected!`);
    }
    catch(e){
        console.log(`Error: ${e.message}`);
        process.exit(1);
    }
}

module.exports = connectDB;