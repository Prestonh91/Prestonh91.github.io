export class Transaction {
	amount: Number | null = null;
	purchaseTimes: Number | null = null;
	transactionDate: Date | null = null;
	isCredit: Boolean | null = null;
	title: string | null = null;
	ward: string | null = null;
	uid: string | null = null;

	constructor(data:any) {
		if (data) {
			this.amount = data.amount ?? null
			this.purchaseTimes = data.purchaseTimes ?? null
			this.transactionDate = data.transactionDate ?? new Date()
			this.isCredit = data.isCredit ?? false
			this.title = data.title ?? null
			this.ward = data.ward ?? null
			this.uid = data.uid ?? null
		}
	}
}