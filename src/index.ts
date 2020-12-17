import express from 'express'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'

import Game from './models/Game'
import * as GameListener from './models/Game/Listener'
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
	res.header('Access-Control-Allow-Headers', 'Authorization')
	res.send()
})

app.post('/games', (req, res) => {
	const leader = req.header('Authorization')
	
	if (!leader) {
		res.status(400).send('Invalid ID')
		return
	}
	
	res.send(new Game(leader).id)
})

io.of('/games').on('connect', (socket: Socket) => {
	GameListener.add(socket.id, games => {
		socket.emit('games', games)
	})
	
	socket.on('disconnect', () => {
		GameListener.remove(socket.id)
	})
})

io.of('/game').on('connect', (socket: Socket) => {
	new User(socket)
})

http.listen(PORT, () => {
	console.log(`Listening on http://localhost:${PORT}`)
})
