<script>
	export let calc = null
</script>

<div class="uk-card uk-card-body uk-text-center display uk-margin-bottom">
	{#if (calc.totalSellPrice === null && calc.netGain === null)}
		<p>Please enter required information below</p>
	{:else}
		<p><b>Total Sell Price:</b> {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD'}).format(calc.totalSellPrice)}</p>
		<p><b>Net Profit:</b> {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD'}).format(calc.netGain)}</p>
	{/if}
</div>

<style>
.display {
	border-radius: 15px;
	background-color: white;
	box-shadow: inset 0 0 4px -1px black
}
</style>