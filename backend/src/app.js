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
import SlotRouter from './routes/slot.routes.js'   
import OrganizerRouter from './routes/organizer.route.js'
import FutsalRouter from './routes/futsal.route.js'
import playerRoutes from './routes/player.route.js' // Importing player routes
//routes declaration

app.use('/api/v1/users', UserRouter)
app.use('/api/v1/games', GameRouter)
app.use('/api/v1/slots', SlotRouter)
app.use('/api/v1/organizer', OrganizerRouter)
app.use('/api/v1/futsals', FutsalRouter)
app.use('/api/v1/player', playerRoutes) // Registering player routes under correct API prefix

export {app}