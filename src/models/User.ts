import { Socket } from 'socket.io'

import Game from './Game'
import ColorPicker from './ColorPicker'

interface Query {
	id: string
	game: string
}

export default class User {
	readonly id: string
	readonly color: string
	readonly game: Game
	
	constructor(readonly socket: Socket) {
		const { id, game } = socket.handshake.query as Query
		
		this.id = id
		this.game = Game.get(game)
		this.color = this.game?.nextColor ?? ColorPicker.DEFAULT
		
		if (!this.game) {
			socket.emit('not-found')
			return
		}
		
		socket.join(this.game.id)
		this.game.addUser(this)
		
		socket.on('start', () => {
			socket.to(this.game.id).emit('start')
		})
		
		socket.on('disconnect', () => {
			this.game.removeUser(this)
			socket.to(this.game.id).emit('users', this.game)
		})
	}
	
	get isLeader() {
		return this.id === this.game.leader
	}
	
	get data() {
		return {
			id: this.id
		}
	}
}
