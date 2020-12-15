import { nanoid } from 'nanoid'

import User from './User'

const games: Record<string, Game> = {}

export default class Game {
	readonly id: string
	readonly users: User[] = []
	
	constructor(readonly name: string, readonly leader: string) {
		games[this.id = nanoid(10)] = this
	}
	
	static readonly get = (id: string) =>
		games[id]
}
