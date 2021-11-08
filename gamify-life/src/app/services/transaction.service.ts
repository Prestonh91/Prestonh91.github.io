import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Transaction } from '../classes';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
	private transactionContainerUrl: string = "transactions/"

	private getWardTransactionsContainerUrl(wUid: string) {
		return `${this.transactionContainerUrl}${wUid}`
	}

	private getTransactionUrl(wUid:string, tUid: string) {
		return `${this.getWardTransactionsContainerUrl(wUid)}/${tUid}`
	}

	constructor(
		private db: AngularFireDatabase
	) { }

	public getTransactionsObservable(wUid: string) {
		return this.db.object(this.getWardTransactionsContainerUrl(wUid)).valueChanges()
	}

	public getTransactionsPromise(wUid: string) {
		return this.db.database.ref(this.getWardTransactionsContainerUrl(wUid)).once('value')
	}

	public async getTransactionsValue(wUid: string) {
		return (await this.db.database.ref(this.getWardTransactionsContainerUrl(wUid)).once('value')).val()
	}

	public updateSaveTransaction(transaction: Transaction, updates: any) {
		if (transaction.uid === null || transaction.ward === null)
			throw new Error("Cannot save transaction")

		updates[this.getTransactionUrl(transaction.ward!, transaction.uid!)] = transaction
	}

	public createTransaction(amount: Number, purchaseTimes: Number, title: string, ward: string, isCredit: boolean = false): Transaction {
		var uid = this.db.database.ref().push()
		return new Transaction({amount: amount, purchaseTimes: purchaseTimes, title: title, ward: ward, uid: uid.key, isCredit: isCredit })
	}
}
