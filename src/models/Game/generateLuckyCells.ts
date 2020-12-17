import Coordinate from '../Coordinate'

export const LUCKY_CELL_TIME = 1000

const MIN_COUNT = 10
const MAX_COUNT = 30

const ROWS = 15
const COLUMNS = 25

const getCount = () =>
	Math.floor(Math.random() * (MAX_COUNT - MIN_COUNT) + MIN_COUNT)

const getCell = (): Coordinate => ({
	x: Math.floor(Math.random() * COLUMNS),
	y: Math.floor(Math.random() * ROWS)
})

const generateLuckyCells = () => {
	const count = getCount()
	const cells = new Array<Coordinate>(count)
	
	for (let i = 0; i < count; i++)
		cells[i] = getCell()
	
	return cells
}

export default generateLuckyCells
