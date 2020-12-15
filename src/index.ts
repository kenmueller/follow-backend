import express from 'express'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import bodyParser from 'body-parser'

import Game from './models/Game'
import User from './models/User'

const PORT = process.env.PORT ?? 5000
const ORIGIN = process.env.NODE_ENV === 'production'
	? 'https://follow.vercel.app'
	: 'http://localhost:3000'

const app = express()
const http = createServer(app)
const io = new Server(http, {
	cors: { origin: ORIGIN }
})

app.use((_req, res, next) => {
	res.header('Access-Control-Allow-Origin', ORIGIN)
	next()
})

app.get('/', (_req, res) => {
	res.redirect(301, ORIGIN)
})

app.options('/games', (_req, res) => {
	res.header('Access-Control-Allow-Methods', 'POST')
	res.header('Access-Control-Allow-Headers', ['Content-Type', 'Authorization'])
	res.send()
})

app.post('/games', bodyParser.json(), (req, res) => {
	const name = req.body?.name
	const leader = req.header('Authorization')
	
	if (!(name && leader)) {
		res.sendStatus(400)
		return
	}
	
	res.send(new Game(name, leader).id)
})

io.on('connect', (socket: Socket) => {
	new User(socket)
})

http.listen(PORT, () => {
	console.log(`Listening on http://localhost:${PORT}`)
})
