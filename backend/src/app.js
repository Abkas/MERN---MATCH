import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'


const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))


app.use(express.json({limit: '50mb' }))
app.use(express.urlencoded({limit: '50mb', extended: true}))
app.use(express.static('public'))

app.use(cookieParser())

//routes
import UserRouter from './routes/user.route.js'  
import GameRouter from './routes/game.route.js'
import SlotRouter from './routes/slot.route.js'   
import OrganizerRouter from './routes/organizer.route.js'
//routes declaration

app.use('/api/v1/users', UserRouter)
app.use('/api/v1/games', GameRouter)
app.use('/api/v1/slots', SlotRouter)
app.use('/api/v1/organizer', OrganizerRouter)


export {app}