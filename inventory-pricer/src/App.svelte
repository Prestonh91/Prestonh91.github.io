<script>
	import Items from './resources/items'
	import { cart, cartValue } from './resources/store'

	$: seaCreatures = Items.filter(x => x.category === 'SeaCreatures').sort((a, b) => a.name - b.name).sort((a, b) => {
		if (sortStyle === 'PriceLH') {
			return a.price - b.price
		}
		if (sortStyle === 'PriceHL') {
			return b.price - a.price
		}
		if (sortStyle === 'Alpabetical') {

			const aName = a.name.toUpperCase()
			const bName = b.name.toUpperCase()

			if (aName < bName) return -1
			if (aName > bName) return 1
			return 0
		}
	})
	$: fish = Items.filter(x => x.category === "Fish").sort((a, b) => {
		if (sortStyle === 'PriceLH') {
			return a.price - b.price
		}
		if (sortStyle === 'PriceHL') {
			return b.price - a.price
		}
		if (sortStyle === 'Alpabetical') {

			const aName = a.name.toUpperCase()
			const bName = b.name.toUpperCase()

			if (aName < bName) return -1
			if (aName > bName) return 1
			return 0
		}
	})
	$: bugs = Items.filter(x => x.category === "Bugs").sort((a, b) => a.name - b.name).sort((a, b) => {
		if (sortStyle === 'PriceLH') {
			return a.price - b.price
		}
		if (sortStyle === 'PriceHL') {
			return b.price - a.price
		}
		if (sortStyle === 'Alpabetical') {

			const aName = a.name.toUpperCase()
			const bName = b.name.toUpperCase()

			if (aName < bName) return -1
			if (aName > bName) return 1
			return 0
		}
	})

	let sortStyle
</script>

<main class="uk-height-viewport">
	<section class="uk-card uk-card-body">
		<div 
			class="background-white"
			uk-sticky
		>
			<h3 class="uk-text-center">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD'}).format($cartValue).split('.')[0]}</h3>
			<div class="uk-position-relative">
				<ul uk-tab="connect: .tabs">
					<li><a href="#">Fish</a></li>
					<li><a href="#">Bugs</a></li>
					<li><a href="#">Sea Creatures</a></li>
				</ul>

				<select bind:value={sortStyle} class="uk-position-absolute uk-width-1-6 uk-select sort-select">
					<option value="Alpabetical">Alpabetical</option>
					<option value="PriceLH">Price (Low To High)</option>
					<option value="PriceHL">Price (High to Low)</option>
				</select>
			</div>
		</div>

		<ul class="uk-switcher tabs">
			<div class="uk-column-1-1 uk-column-1-2@m uk-column-1-3@l">
				{#each fish as item}
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
			</div>
			<div class="uk-column-1-1 uk-column-1-2@m uk-column-1-3@l">
				{#each bugs as item}
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
			</div>
			<div class="uk-column-1-1 uk-column-1-2@m uk-column-1-3@l">
				{#each seaCreatures as item}
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
			</div>
		</ul>
	</section>
</main>

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

.background-white {
	background-color: white;
	padding-top: 10px;
}

.sort-select {
	top: -12px;
	right: 10px;
}
</style>