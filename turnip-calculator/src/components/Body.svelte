<script>
	import { createEventDispatcher } from 'svelte'
	import NumberInput from './NumberInput.svelte'
	import SaleRecord from './SaleRecord.svelte'
	const dispatch = createEventDispatcher();

	export let calc = null

	function updateCalculator() {
		calc.updateDisplayValue()
	}

	function addSellRecord() {
		calc.addSellRecord()
		records = [...calc.saleRecords]
	}

	function resetSellRecords() {
		calc.resetSellRecords()
		records = [...calc.saleRecords]
		calc.updateCalc()
		dispatch('updateCalc')
	}

	function updateCalc() {
		calc.updateCalc()
		dispatch('updateCalc')
	}

	$: records = [...calc.saleRecords]

</script>

<section class="uk-card uk-card-body body uk-form-stacked">
	<section class="uk-margin-bottom">
		<header>
			<h3 class="uk-text-center">Please enter Turnip buying information</h3>
		</header>
		<div class="uk-width-1-1" uk-grid>
			<div class="uk-width-1-1 uk-width-1-2@s label-spacing">
				<label class="uk-form-label">Turnips Buy Price</label>
				<NumberInput decimalScale={0} bind:value={calc.turnipBuyPrice}/>
			</div>
			<div class="uk-width-1-1 uk-width-1-2@s label-spacing">
				<label class="uk-form-label"># Bought</label>
				<NumberInput decimalScale={0} bind:value={calc.numberOfTurnipsBought}/>
			</div>
		</div>
	</section>

	<section>
		<header>
			<h3 class="uk-text-center">Please enter each Turnip sell record</h3>
		</header>

		<div class="uk-margin-bottom">
			{#each records as record, i}
				<SaleRecord {record} on:updateCalc={updateCalc}/>
			{/each} 
		</div>
		<div uk-grid class="uk-flex-center">
			<div>
				<button type="button" class="uk-margin-auto uk-display-block button primary" on:click={addSellRecord}>Add record</button>
			</div>
			<div>
				<button type="button" class="uk-margin-auto uk-display-block button secondary" on:click={resetSellRecords}>Reset Sell Records</button>
			</div>
		</div>
	</section>
</section>

<style>
.body {
	background-color: white;
	border-radius: 15px;
	box-shadow: 0 0 3px lightgray
}

.label-spacing {
	display: flex;
	flex-wrap: wrap;
	align-items: flex-end;
}

.label-spacing > .uk-form-label {
	box-sizing: border-box;
	width: 100%;
	max-width: 100%;
}
</style>