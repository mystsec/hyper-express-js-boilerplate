import mongoose from "mongoose";
import { config } from './config.js';

if (config.db.user == "" && config.db.pw == "") {
    mongoose.connect(
        `mongodb://${config.db.host}:${config.db.port}/${config.db.db}`,
        { useNewUrlParser: true, useUnifiedTopology: true }
    );
} else {
    mongoose.connect(
        `mongodb://${config.db.user}:${encodeURIComponent(config.db.pw)}@${config.db.host}:${config.db.port}/${config.db.db}`
    );
}

const db = mongoose.connection;
db.on("error", function (e) {
    console.log("Unable to connect to MongoDB: " + e);
    process.exit(1);
});

db.once("open", function () {
    console.log(`Successfully connected to MongoDB on port ${config.db.port}`);
});

export default mongoose;
