<script>
	import { cart } from '../resources/store'
	
	export var Items = []
	export var filterType = null
	export var sortStyle = "Alphabetical"

	$: filteredItems = Items.filter(x => x.category === filterType).sort((a, b) => {
		if (sortStyle === 'PriceLH') {
			return a.price - b.price
		}
		if (sortStyle === 'PriceHL') {
			return b.price - a.price
		}
		if (sortStyle === 'Alphabetical') {

			const aName = a.name.toUpperCase()
			const bName = b.name.toUpperCase()

			if (aName < bName) return -1
			if (aName > bName) return 1
			return 0
		}
	})
</script>

{#each filteredItems as item}
	<div class="uk-width-1-1 uk-margin uk-flex uk-flex-between uk-flex-wrap uk-flex-middle">
		<p class="uk-margin-remove">{item.name} - {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD'}).format(item.price).split('.')[0]}</p>
		<div>
			<img src="svgs/RemoveButton.svg" alt="Remove Button" on:click={() => cart.remove(item)} height="25" width="25" class="uk-margin-small-right"/>
			<input 
				type="number"  
				min="0" 
				class="uk-text-center item-number"
				value={$cart.find(i => i.id === item.id) ? $cart.find(i => i.id === item.id).count : 0} on:input={event => cart.setItemCount(item, Number(event.target.value))}>
			<img src="svgs/AddButton.svg" alt="Add Button" on:click={() => cart.add(item)} height="25" width="25" class="uk-margin-small-left"/>
		</div>
	</div>
{/each}

<style>
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button { 
  -webkit-appearance: none;
}

.item-number {
	font-size: 16px;
	border-radius: 1em;
	border: solid 2px #50B7C6;
	min-width: 20px;
	max-width: 25px;
	min-height: 20px;
	outline: none;
}
</style>