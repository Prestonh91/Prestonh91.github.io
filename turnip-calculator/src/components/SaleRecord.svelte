<script>
	import NumberInput from './NumberInput.svelte'
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function updateCalc() {
		dispatch('updateCalc')
	}

	export let record
</script>

<section class="uk-margin-top">
	<div uk-grid>
		<div class="uk-width-1-1 uk-width-1-2@s label-spacing">
			<label class="uk-form-label">Turnips Sell Price</label>
			<NumberInput decimalScale={0} bind:value={record.turnipSellPrice} on:input={updateCalc}/>
		</div>
		<div class="uk-width-1-1 uk-width-1-2@s label-spacing">
			<label class="uk-form-label"># Sold</label>
			<NumberInput decimalScale={0} bind:value={record.numberOfTurnipsSold} on:input={updateCalc}/>
		</div>
	</div>
</section>