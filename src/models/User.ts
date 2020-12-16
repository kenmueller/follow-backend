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
	readonly score: number | null
	readonly location: Coordinate | null
	
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
		this.emitData()
		
		if (!started)
			this.game.addUser(this)
		
		socket.on('start', () => {
			if (!this.isLeader)
				return
			
			this.game.started = true
			socket.to(this.game.id).emit('start')
		})
		
		socket.on('disconnect', () => {
			this.game.removeUser(this)
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
	
	private readonly emitData = () => {
		this.socket.emit('data', {
			game: this.game.data,
			self: this.data
		})
	}
}
