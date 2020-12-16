import _ from 'lodash'
import { nanoid } from 'nanoid'

import User, { UserData } from './User'
import ColorPicker from './ColorPicker'

const games: Record<string, Game> = {}

export interface GameData {
	id: string
	leader: string
	started: boolean
}

export default class Game {
	static readonly DEFAULT_COLOR = ColorPicker.DEFAULT
	
	readonly id: string = nanoid(10)
	private readonly users: User[] = []
	
	private readonly colorPicker: ColorPicker = new ColorPicker()
	started: boolean = false
	
	constructor(readonly leader: string) {
		games[this.id] = this
	}
	
	static readonly get = (id: string) =>
		games[id]
	
	get data(): GameData {
		const { id, leader, started } = this
		return { id, leader, started }
	}
	
	get nextColor() {
		return this.colorPicker.next
	}
	
	readonly addUser = (user: User) => {
		this.users.push(user)
		this.emitUsers()
	}
	
	readonly removeUser = (user: User) => {
		const index = this.users.indexOf(user)
		
		if (index < 0)
			return
		
		this.users.splice(index, 1)
		this.emitUsers()
	}
	
	readonly emitUsers = () => {
		for (const user of this.users)
			user.socket.emit(
				'users',
				this.users.reduce((users: UserData[], _user) => {
					if (user.id !== _user.id) {
						const { data } = _user
						data && users.push(data)
					}
					
					return users
				}, [])
			)
	}
}
