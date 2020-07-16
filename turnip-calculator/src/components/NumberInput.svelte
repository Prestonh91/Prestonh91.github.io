<script>
	import { onMount } from 'svelte'
	import Cleave from 'cleave.js';
	export let value = null
	export let decimalScale = 2
	export let tabindex = 0

	onMount(() => {
		document.querySelectorAll('.number-input').forEach(function(el) {
			new	Cleave(el, {
				numeral: true,
				numeralDecimalScale: decimalScale,
				numeralPositiveOnly: true,
			})
		})
	})

</script>

<div class="uk-width-1-1">
	<input {tabindex} class="number-input uk-width-1-1" min="1" type="text" bind:value={value} on:input>
</div>

<style>
.number-input {
	background-color: #FFFAE4;
	border: 0.5px solid #c2beb0;
	border-radius: 2em;
	padding: 2px 8px;
}
.number-input:focus {
	outline: none;
	border: 1px solid #EFBA54;
	border-radius: 2em;
}
</style>