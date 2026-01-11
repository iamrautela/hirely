// const express = require('express');

import express from "express";
import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import cors from "cors";
import {serve} from "inngest/express";
import { inngest, functions } from "./lib/inngest.js";


const app = express();

console.log(process.env.PORT);
console.log(process.env.DB_URL);

//Middleware
app.use(express.json())
//credentails:true meaning ?? => server allows a browswer to include cookies
app.use(cors({origin:ENV.CLIENT_URL, credentials:true}))

app.use("/api/inngest", serve({client:inngest, functions}))

app.get("/health", (req, res) => {
    res.status(200).json({ msg: "api is up and running" });
})


const startServer = async () => {
    try {
        await connectDB();
        app.listen(ENV.PORT, () => {
            console.log(`Server is running on port ${ENV.PORT}`);
        });

    } catch (error) {
        console.error("Error starting the server:", error);

    }
}
startServer();