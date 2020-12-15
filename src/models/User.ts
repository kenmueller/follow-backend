import { Socket } from 'socket.io'

export default class User {
	readonly id: string
	
	constructor(readonly socket: Socket) {
		this.id = socket.id
		
		socket.on('disconnect', () => {
			
		})
	}
}
