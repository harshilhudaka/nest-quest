const mongoose = require("mongoose");
const initData = require("./data");
const listing =require("../models/listing");
const { init } = require("../models/user");

const mongo_url = 'mongodb://127.0.0.1:27017/nest-quest';

main().then(()=>{
    console.log("DB is connected");
}).catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect(mongo_url);
}

const initDB = async () =>{
    await listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({
        ...obj,
        owner:"69e3cebb33902787d7ec83a9",
    }))
    await listing.insertMany(initData.data);
    console.log("data was initialized");
};

initDB();