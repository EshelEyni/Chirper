import mongoose from "mongoose";


const postSchema = new mongoose.Schema({
    title: String,
    content: String,
    imagePath: String
});

