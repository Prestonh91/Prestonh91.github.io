<script>
	import Display from './Display.svelte'
	import Body from './Body.svelte'
	import Calculator from '../calculator'

	let display = "non default display"
	let calc = new Calculator()

	function updateCalc() {
		calc = new Calculator(calc)
	}
</script>

<section uk-height-viewport="offset-top: true" class="calculator-background uk-flex uk-flex-column uk-flex-middle uk-flex-center uk-padding-small">
	<div class="uk-card uk-card-body uk-card-default body-background body-radius uk-width-5-6 uk-width-1-2@m">
		<Display calc={calc}/>
		<Body {calc} on:updateCalc={updateCalc}/>
	</div>
</section>

<style>
.calculator-background {
	background-color: #50B7C6;
}

.body-background {
	background-color: #EFBA54;
}

.body-radius {
	border-radius: 10px 40px;
}

</style>