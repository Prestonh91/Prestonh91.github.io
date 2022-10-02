<template>
<main class="scanner-core">
	<div v-if="decidingFate" style="position: absolute; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center"><div class="loader"></div></div>
	<div 
		class="results-container"
		:class="{ 'hidden': !showResults, 'animate-results-container': showResults }"	
	>
		<p>Your Midi-Chlorian Count is: {{ results }}</p>
		<p>{{ resultsSubText }}</p>
	</div>
	<div class="grid-background" :class="{ 'grid-background-animate': gridAnimating }"></div>
	<div class="grid-bars-container" :class="{ 'hidden' : !gridAnimating }">
		<div v-for="row in gridBars" :key="row" class="grid-bar"></div>
	</div>
	<div 
		class="vertical-scanner-bar"
		:class="{ 'vertical-scanner-bar-animate' : verticalScanning, 'hidden': !verticalScanning}"	
	></div>
	<div style="display: flex; justify-content: end;">	
		<div 
			class="vertical-scanner-bar"
			:class="{ 'vertical-scanner-bar-animate-reverse' : verticalScanning, 'hidden': !verticalScanning}"	
		></div>
	</div>
	<div 
		id="horizontal-scanner"
		class="horizontal-scanner-bar"
		:class="{ 'horizontal-scanner-bar-animate' : horizontalScanning, 'hidden': !horizontalScanning}"	
	></div>
	<div style="display: flex; align-items: end; position: absolute; height: 100vh">	
		<div 
			class="horizontal-scanner-bar"
			:class="{ 'horizontal-scanner-bar-animate-reverse' : horizontalScanning, 'hidden': !horizontalScanning}"	
		></div>
	</div>
	<div
		class="sc-button-container"
		:class="{ 'hidden' : isAnimating }"
	>
		<button class="sc-button" @click="startScan">Activate ScaN</button>
	</div>
	<div
		class="welcome-badge"
		:class="{ 'hidden' : isAnimating }"
	>Midi-Chlorian Scanner</div>
</main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

class AppData {
	horizontalScanning: Boolean = false;
	verticalScanning: Boolean = false;
	gridAnimating: Boolean = false;
	showResults: Boolean = false;
	results: number = 0;
	midiChlorianMax: number = 25000;
	audio: HTMLAudioElement | null = null;
	gridBars: Array<any> = new Array(36);
	decidingFate: boolean = false;
}

export default defineComponent({
	data() {
		return new AppData()
	},

	created() {
		this.audio = this.requestAudio()
	},

	mounted() {
	},

	computed: {
		resultsSubText() : String {
			if (this.results < 6250) {
				return "I find your lack of faith disturbing."
			} else if (this.results >= 6250 && this.results < 12500) {
				return "Your path you must decide."
				// Difficult to see. Always in motion is the future.
			} else if (this.results >= 12500 && this.results < 18750) {
				return "The Force is strong with this one."
			} else {
				return "Even Master Yoda doesn't have a midi-chlorian count that high. No Jedi has."
			}
		},
		isAnimating() : Boolean {
			return this.verticalScanning || this.horizontalScanning || this.gridAnimating || this.decidingFate
		}
	},

	methods: {
		requestAudio(): HTMLAudioElement {
			return new Audio('../dist/scanner.mp3')
		},
		startScan() {
			this.audio?.play()
			this.audio?.pause()
			this.results = 0
			this.showResults = false

			this.fetchMidiChlorianCount()
			this.gridAnimating = true

			setTimeout(() => {
				this.verticalScanning = true
				this.audio?.play()

				setTimeout(() => {
					this.verticalScanning = false
					this.horizontalScanning = true

					setTimeout(() => {
						this.horizontalScanning = false
						this.gridAnimating = false
						this.audio?.pause()
						this.requestAudio()

						this.decidingFate = true

						setTimeout(() => {
							this.decidingFate = false
							this.showResults = true
						}, 2500) 
					}, 1700);
				}, 1700);
			}, 1700);
		},
		fetchMidiChlorianCount() {
			this.results = Math.floor(Math.random() * this.midiChlorianMax)
		}
	}
})
</script>

<style>
:root {
	--amethyst: #E578FF;
	--scanner-red: #a8030b;
}

.loader {
	position: relative;
	width: 64px;
	height: 64px;
	border-radius: 50%;
	border: 2px solid white;
	animation: loader-spin 1s ease-in-out infinite;
}

.loader:after {
	content: " ";
	position: absolute;
	left: -1px;
	border: 33px solid white;
	border-radius: 50%;
	border-color: transparent white transparent white;
}

@keyframes loader-spin {
	from {
		transform: rotate(0de);
	}
	to {
		transform: rotate(360deg);
	}
}

.grid-background {
	position:absolute;
	width: 100vw;
	height: 100vh;
	background-color: #C3C55B;
	right: 100vw;
	bottom: 100vh;
	z-index: 5;
}

.grid-background-animate {
	animation: grid-background-change 1.7s linear forwards;
}

.grid-bars-container {
	position: absolute;
	top: 0;
	left: 0;
	display: flex;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 1px;
	height: 100vh;
	width: 100vw;
}

.grid-bar {
	box-sizing: border-box;
	background-color: black;
	z-index: 6;
	flex-grow: 1;
	flex-basis: 24%;
	flex-shrink: 1;
}


@keyframes grid-background-change {
	0% {
		right: 100vw;
		bottom: 100vh;
	}
	100% {
		right: 0;
		bottom: 0;
	}
}

.scanner-core {
	height: 100vh;
	position: relative;
	overflow: hidden;
}

.vertical-scanner-bar {
	position: absolute;
	height: 100vh;
	width: 10px;
	background: linear-gradient(90deg, rgb(255, 220, 208) 0%, rgb(255, 231, 217)  ,rgb(255, 220, 208) 100%);
	box-shadow: 0 0 20px 10px #FB6159;
	z-index: 10;
}

.horizontal-scanner-bar {
	position: absolute;
	width: 100vw;
	height: 10px;
	box-shadow: 0 0 14px 12px #6DC8E9;
	background: linear-gradient(rgb(223,245,251) 0%, rgb(254,250,252) 50%, rgb(223,245,251) 100%);
	z-index: 10;
}

.vertical-scanner-bar-animate {
	animation: vertical-scanner 1.7s ease-in-out forwards;
}

.vertical-scanner-bar-animate-reverse {
	animation: vertical-scanner-reverse 1.7s ease-in-out forwards;
}

.horizontal-scanner-bar-animate {
	animation: horizontal-scanner 1.7s ease-in-out forwards;
}

.horizontal-scanner-bar-animate-reverse {
	animation: horizontal-scanner-reverse 1.7s ease-in-out forwards;
}

.hidden {
	display: none !important;
}

.results-container {
	box-sizing: border-box;
	padding: 0 7px;
	position: absolute;
	width: 100vw;
	text-align: center;
	color: white;
	font-size: 20px;
	font-family: 'Star Wars';
}

.animate-results-container {
	animation: fade-in-slide-in 1s ease-out both;
}

@keyframes fade-in-slide-in {
	0% {
		top: -50px;
		opacity: 0;
	}
	100% {
		top: 20px;
		opacity: 1;
	}
}

.sc-button-container {
	z-index: 20;
	display: flex; 
	flex-direction: column;
	justify-content: center; 
	align-items: center; 
	height: 100vh;
}

.sc-button {
	height: 150px;
	width: 275px;
	color: white;
	background: linear-gradient(45deg, black 0%, black 48%, var(--amethyst) 50%,  black 52%, black 100%);
	cursor: pointer;
	position: relative;
	border-top: 4px solid var(--amethyst);
	border-bottom: 4px solid var(--amethyst);
	border-right: 0;
	border-left: 0;
	font-size: 24px;
	font-family: 'Star Wars';
	background-size: 300%;
	animation: button-shine 6s linear infinite both;
}

@keyframes button-shine {
	0% {
		background-position: -20% 0%;
	}
	16.67% {
		background-position: 100% 0%;
	}
	100% {
		background-position: 100% 0%;
	}
}

.sc-button:before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	height: 60%;
	width: 4px;
	background-color: var(--amethyst);
}

.sc-button:after {
	content: "";
	position: absolute;
	bottom: 0;
	right: 0;
	height: 60%;
	width: 4px;
	background-color: var(--amethyst);
}

.welcome-badge {
	color: white;
	position: absolute;
	font-family: "Mandolor";
	bottom: 75px;
	right: 0;
	width: 100vw;
	text-align: center;
	font-size: 48px;
	z-index: 20;
}

@keyframes vertical-scanner {
	0% {
		transform: translate(0vw);
	}
	50% {
		transform: translate(49vw);
	}
	100% {
		transform: translate(0vw);
	}
}

@keyframes vertical-scanner-reverse {
	0% {
		transform: translate(0vw);
	}
	50% {
		transform: translate(-49vw);
	}
	100% {
		transform: translate(0vw);
	}
}

@keyframes horizontal-scanner {
	0% {
		transform: translate(0, 0vh);
	}
	50% {
		transform: translate(0, 49vh);
	}
	100% {
		transform: translate(0, 0vh);
	}
}

@keyframes horizontal-scanner-reverse {
	0% {
		transform: translate(0, 0vh);
	}
	50% {
		transform: translate(0, -49vh);
	}
	100% {
		transform: translate(0, 0vh);
	}
}
</style>