import dontenv from "dotenv";


dontenv.config();

export const ENV={
    PORT: process.env.PORT,
    DB_URL: process.env.DB_URL
};