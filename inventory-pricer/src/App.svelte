<script>
	import Items from './resources/items'
	import { cart, cartValue } from './resources/store'

	const seaCreatures = Items.filter(x => x.category === 'SeaCreatures')
	const fish = Items.filter(x => x.category === "Fish")
	const bugs = Items.filter(x => x.category === "Bugs")
</script>

<main class="uk-height-viewport">
	<section class="uk-card uk-card-body">
		<div 
			class="background-white"
			uk-sticky
		>
			<h3 class="uk-text-center">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD'}).format($cartValue).split('.')[0]}</h3>
			<ul uk-tab="connect: .tabs">
				<li><a href="#">Fish</a></li>
				<li><a href="#">Bugs</a></li>
				<li><a href="#">Sea Creatures</a></li>
			</ul>
		</div>

		<ul class="uk-switcher tabs">
			<div class="uk-flex-wrap" style="margin-top: 40px;" uk-grid>
				{#each fish as item}
					<div class="uk-width-1-1 uk-width-1-2@m uk-width-1-3@l uk-flex uk-flex-between uk-flex-wrap uk-flex-middle">
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
			<div class="uk-flex-wrap" uk-grid>
				{#each bugs as item}
					<div class="uk-width-1-1 uk-width-1-2@m uk-width-1-3@l uk-flex uk-flex-between uk-flex-wrap uk-flex-middle">
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
			<div class="uk-flex-wrap" uk-grid>
				{#each seaCreatures as item}
					<div class="uk-width-1-1 uk-width-1-2@m uk-width-1-3@l uk-flex uk-flex-between uk-flex-wrap uk-flex-middle">
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
</style>