import { Socket } from 'socket.io'

import UserQuery from './Query'
import UserData from './Data'
import Game from '../Game'
import GameState from '../Game/State'
import Coordinate, { getZeroCoordinate } from '../Coordinate'

export default class User {
	readonly game: Game
	
	readonly id: string
	readonly color: string | null
	score: number | null
	location: Coordinate | null
	
	constructor(readonly socket: Socket) {
		const { id, game } = socket.handshake.query as UserQuery
		
		this.id = id
		this.game = Game.get(game)
		
		const isSpectating = this.game?.state !== GameState.Waiting
		
		this.color = isSpectating ? null : this.game.nextColor ?? Game.DEFAULT_COLOR
		this.score = isSpectating ? null : 0
		this.location = isSpectating ? null : getZeroCoordinate()
		
		if (!this.game) {
			socket.emit('not-found')
			return
		}
		
		socket.join(this.game.id)
		
		this.onJoin()
		this.game.addUser(this)
		
		socket.on('start', () => {
			if (!(this.isLeader && this.game.state === GameState.Waiting))
				return
			
			this.game.state = GameState.Starting
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
