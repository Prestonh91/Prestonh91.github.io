<script>
	import { onMount, tick } from 'svelte'
	import ItemTypeList from './components/ItemTypeList.svelte'
	import Items from './resources/items'
	import { cart, cartValue } from './resources/store'

	let sortStyle

	onMount(async () => {
		await tick();
		var bugs = document.getElementById("Bugs")
		bugs.removeAttribute("class")
		console.log(bugs)

		document.getElementById("SeaCreatures").removeAttribute("class")

		document.getElementById("Flowers").removeAttribute("class")
	})
</script>

<main class="uk-height-viewport">
	<section class="uk-card uk-card-body">
		<div 
			class="background-white uk-margin-bottom"
			uk-sticky
		>
			<div class="uk-flex-middle uk-flex-center uk-margin-bottom" uk-grid>
				<div>
					<button class="button primary" on:click={cart.reset}>Reset</button>				
				</div>

				<h3 class="uk-text-center">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD'}).format($cartValue).split('.')[0]}</h3>
				
				<div class="uk-width-1-6@m uk-width-1-3">
					<select bind:value={sortStyle} class="uk-select sort-select">
						<option value="Alpabetical">Alpabetical</option>
						<option value="PriceLH">Price (Low To High)</option>
						<option value="PriceHL">Price (High to Low)</option>
					</select>
				</div>
			</div>
			
			<ul uk-tab="connect: .tabs" class="uk-flex-center">
				<li id="Fish"><a href="#">Fish</a></li>
				<li id="Bugs"><a href="#">Bugs</a></li>
				<li id="SeaCreatures"><a href="#">Sea Creatures</a></li>
				<li id="Flowers"><a href="#">Flowers</a></li>
			</ul>
		</div>

		<ul class="uk-switcher tabs">
			<div class="uk-column-1-1 uk-column-1-2@m uk-column-1-3@l">
				<ItemTypeList {Items} filterType={"Fish"} {sortStyle}/>
			</div>
			<div class="uk-column-1-1 uk-column-1-2@m uk-column-1-3@l">
				<ItemTypeList {Items} filterType={"Bugs"} {sortStyle}/>
			</div>
			<div class="uk-column-1-1 uk-column-1-2@m uk-column-1-3@l">
				<ItemTypeList {Items} filterType={"SeaCreatures"} {sortStyle}/>
			</div>
			<div class="uk-column-1-1 uk-column-1-2@m uk-column-1-3@l">
				<ItemTypeList {Items} filterType={"Flowers"} {sortStyle}/>
			</div>
		</ul>
	</section>
</main>

<style>
.background-white {
	background-color: white;
	padding-top: 10px;
}

.sort-select {
	top: -50px;
	right: 10px;
}
</style>