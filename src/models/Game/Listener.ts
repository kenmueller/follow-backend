import { games } from '.'
import GameData from './Data'

export type Listener = (games: GameData[]) => void

const listeners: Record<string, Listener> = {}

const getGames = () =>
	Object.values(games)
		.map(({ data }) => data)
		.sort((a, b) => a.state - b.state)

export const emit = () => {
	const data = getGames()
	
	for (const listener of Object.values(listeners))
		listener(data)
}

export const add = (id: string, listener: Listener) => {
	listeners[id] = listener
	listener(getGames())
}

export const remove = (id: string) => {
	delete listeners[id]
}
