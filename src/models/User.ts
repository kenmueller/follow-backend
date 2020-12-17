import { Socket } from 'socket.io'

import Game from './Game'
import Coordinate, { getZeroCoordinate } from './Coordinate'

interface Query {
	id: string
	game: string
}

export interface UserData {
	id: string
	color: string
	score: number
	location: Coordinate
}

export default class User {
	readonly game: Game
	
	readonly id: string
	readonly color: string | null
	score: number | null
	location: Coordinate | null
	
	constructor(readonly socket: Socket) {
		const { id, game } = socket.handshake.query as Query
		
		this.id = id
		this.game = Game.get(game)
		
		const started = this.game?.started ?? true
		
		this.color = started ? null : this.game.nextColor ?? Game.DEFAULT_COLOR
		this.score = started ? null : 0
		this.location = started ? null : getZeroCoordinate()
		
		if (!this.game) {
			socket.emit('not-found')
			return
		}
		
		socket.join(this.game.id)
		this.onJoin()
		
		if (!started)
			this.game.addUser(this)
		
		socket.on('start', () => {
			if (!this.isLeader)
				return
			
			this.game.started = true
			socket.to(this.game.id).emit('start')
		})
		
		socket.on('location', (location: Coordinate) => {
			this.location = location
			this.game.emitUsers(this)
		})
		
		socket.on('disconnect', () => {
			const { socket, game, data: self } = this
			
			if (self)
				socket.to(game.id).emit('leave', self)
			
			game.removeUser(this)
		})
	}
	
	get isLeader() {
		return this.id === this.game.leader
	}
	
	get data(): UserData | null {
		const { id, color, score, location } = this
		
		return color === null || score === null || location === null
			? null
			: { id, color, score, location }
	}
	
	readonly onJoin = () => {
		const { socket, game, data: self } = this
		
		if (self)
			socket.to(game.id).emit('join', self)
		
		socket.emit('data', { game: game.data, self })
	}
}
