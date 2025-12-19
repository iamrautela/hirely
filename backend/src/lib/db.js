import mongoose from "mongoose";

import {ENV} from "./env.js"

export const connectDB= async()=>{
    try{
        const conn = await mongoose.connect(ENV.DB_URL)
        console.log("connected to mongodb:", conn.connection.host)


    } catch (error) {
        console.error("Eroor connetcting to MongoDB:", error);
        process.exit(1); // 0 means sucess and 1 means failure

    }
};