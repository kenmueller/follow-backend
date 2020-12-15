import _ from 'lodash'

const COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple']

export default class ColorPicker {
	static readonly DEFAULT = 'white'
	
	private readonly colors: string[] = _.shuffle(COLORS)
	private index: number = 0
	
	get next() {
		const color = this.colors[this.index]
		this.index = (this.index + 1) % this.colors.length
		
		return color
	}
}
