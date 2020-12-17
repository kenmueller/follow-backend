import GameState from './State'

export default interface GameData {
	id: string
	leader: string
	state: GameState
}
