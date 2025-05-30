// require('dotenv').config({path: './.env'})

import mongoose from 'mongoose'
import {DB_NAME} from './constants.js'
import express from 'express'
import connectDB from './db/index.js'

import {app} from './app.js'

import dotenv from 'dotenv';
dotenv.config({ path: './.env' });



connectDB()
.then(() =>{
    app.listen(process.env.PORT || 8000, () =>{
        console.log(`Server is running on port ${process.env.PORT || 8000}`)
    })
})
.catch((error) => {
    console.error('MONGO DB CONNECTION FAILED!!!!', error);
    throw error;
})



// const app = express()
// (async () =>{
//     try{
//         await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
//         app.on('error',(error)=>{
//             console.log('app not able to connect to db')
//             throw error
//         })

//         app.listen(process.env.PORT,()=>{
//             console.log(`Server is running on port ${process.env.PORT}`)
//         })

//     }catch(error){
//         conole.error('ERROR:',error)
//         throw error
//     }
// })