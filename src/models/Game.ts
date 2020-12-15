import _ from 'lodash'
import { nanoid } from 'nanoid'

import User from './User'
import ColorPicker from './ColorPicker'

const games: Record<string, Game> = {}

export default class Game {
	readonly id: string = nanoid(10)
	private readonly users: User[] = []
	
	private readonly colorPicker: ColorPicker = new ColorPicker()
	started: boolean = false
	
	constructor(readonly leader: string) {
		games[this.id] = this
	}
	
	get nextColor() {
		return this.colorPicker.next
	}
	
	readonly addUser = (user: User) => {
		this.users.push(user)
	}
	
	readonly removeUser = (user: User) => {
		const index = this.users.indexOf(user)
		
		if (~index)
			this.users.splice(index, 1)
	}
	
	static readonly get = (id: string) =>
		games[id]
}
