export default interface Coordinate {
	x: number
	y: number
}

export const getZeroCoordinate = (): Coordinate => ({
	x: 0,
	y: 0
})
