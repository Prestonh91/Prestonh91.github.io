export default class Player {
	econService = null;
	techService = null;
	shipService = null;

	constructor(
		econService = null,
		techService = null,
		shipService = null
	) {
		this.econService = econService
		this.techService = techService
		this.shipService = shipService

		if (!this.econService || !this.shipService || !this.techService)
			throw new Error('You have created a player without a service. Ensure a player has all three services')
	}
}