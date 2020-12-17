import { nanoid } from 'nanoid'

import GameState from './State'
import GameData from './Data'
import User from '../User'
import UserData from '../User/Data'
import ColorPicker from '../ColorPicker'

const games: Record<string, Game> = {}

export default class Game {
	static readonly DEFAULT_COLOR = ColorPicker.DEFAULT
	
	readonly id: string = nanoid(10)
	private users: User[] = []
	
	private readonly colorPicker: ColorPicker = new ColorPicker()
	state: GameState = GameState.Waiting
	
	constructor(readonly leader: string) {
		games[this.id] = this
	}
	
	static readonly get = (id: string) =>
		games[id]
	
	get data(): GameData {
		const { id, leader, state } = this
		return { id, leader, state }
	}
	
	get nextColor() {
		return this.colorPicker.next
	}
	
	readonly addUser = (user: User) => {
		this.users = [...this.users, user]
			.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
		
		this.emitUsers()
	}
	
	readonly removeUser = (user: User) => {
		const index = this.users.indexOf(user)
		
		if (index < 0)
			return
		
		this.users.splice(index, 1)
		this.emitUsers()
	}
	
	readonly emitUsers = (notUser?: User) => {
		for (const user of this.users) {
			if (user === notUser)
				continue
			
			user.socket.emit(
				'users',
				this.users.reduce((users: UserData[], otherUser) => {
					if (user.id !== otherUser.id) {
						const { data } = otherUser
						data && users.push(data)
					}
					
					return users
				}, [])
			)
		}
	}
}
