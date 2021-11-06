export class Transaction {
	amount: Number | null = null;
	isCredit: Boolean | null = null;
	questName: string | null = null;
	perkName: string | null = null;
	ward: string | null = null;
	uid: string | null = null;

	constructor(data:any) {
		if (data) {
			this.amount = data.amount ?? 0
			this.isCredit = data.isCredit ?? false
			this.questName = data.questName ?? null
			this.perkName = data.perkName ?? null
			this.ward = data.ward ?? null
			this.uid = data.uid ?? null
		}
	}
}