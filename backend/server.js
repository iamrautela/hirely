// const express = require('express');

import express from "express";

const app = express()

app.get("/", (req, res) => {
    res.status(200).json({msg: "success for project 124"})
})

app.listen(3000, () => console.log("Server is running on port 3000"))