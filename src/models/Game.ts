import _ from 'lodash'
import { nanoid } from 'nanoid'

import User from './User'
import ColorPicker from './ColorPicker'

const games: Record<string, Game> = {}

export interface GameData {
	id: string
	leader: string
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
		const { id, leader } = this
		return { id, leader }
	}
	
	get nextColor() {
		return this.colorPicker.next
	}
	
	private get usersData() {
		return this.users.map(({ data }) => data)
	}
	
	readonly addUser = (user: User) => {
		this.emitUsersTo(user)
		this.users.push(user)
		this.emitUsersFrom(user)
	}
	
	readonly removeUser = (user: User) => {
		const index = this.users.indexOf(user)
		
		if (index < 0)
			return
		
		this.users.splice(index, 1)
		this.emitUsersFrom(user)
	}
	
	readonly emitUsersFrom = (user: User) => {
		user.socket.to(this.id).emit('users', this.usersData)
	}
	
	readonly emitUsersTo = (user: User) => {
		user.socket.emit('users', this.usersData)
	}
}
