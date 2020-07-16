export function getNumber(num) {
	if (typeof num === 'number') return num
	
	if (typeof num === 'undefined' || num === null) return 0

	if (typeof num === 'string') return Number(num.split(',').join(''))

	throw new Error("getNumber: An unexpected variable type was provided.")
}
