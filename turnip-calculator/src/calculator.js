import { getNumber } from './utils/Number'

class Calculator {
	
	constructor(data) {
		this.totalSellPrice = data ? data.totalSellPrice : null
		this.netGain = data ? data.netGain : null
		this.numberOfTurnipsBought = data ? data.numberOfTurnipsBought : null
		this.turnipBuyPrice = data ? data.turnipBuyPrice : null
		this.saleRecords = data ? data.saleRecords : [ new SellRecord() ]
	}

	updateCalc() {
		this.totalSellPrice = this.saleRecords.reduce((acc, curr) => {
			return acc + (getNumber(curr.numberOfTurnipsSold) * getNumber(curr.turnipSellPrice))
		}, 0)

		this.netGain = this.totalSellPrice - (getNumber(this.numberOfTurnipsBought) * getNumber(this.turnipBuyPrice))
	
		if (this.totalSellPrice == 0 || isNaN(this.totalSellPrice) || isNaN(this.netGain)) {
			this.totalSellPrice = null
			this.netGain = null
		}
	}

	addSellRecord() {
		this.saleRecords.push(new SellRecord())
	}

	resetSellRecords() {
		this.saleRecords = [new SellRecord()]
	}
}

class SellRecord {
	constructor() {
		this.numberOfTurnipsSold = null
		this.turnipSellPrice = null
	}
}

export default Calculator