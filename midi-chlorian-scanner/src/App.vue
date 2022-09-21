<template>
<main class="scanner-core">
	<div class="grid-background" :class="{ 'grid-background-animate': gridAnimating }"></div>
	<div class="grid-bars-container" :class="{ 'hidden' : !gridAnimating}">
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
	audio: HTMLAudioElement | null = null;
	gridBars: Array<any> = new Array(32);
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
		isAnimating() {
			return this.verticalScanning || this.horizontalScanning || this.gridAnimating
		}
	},

	methods: {
		requestAudio(): HTMLAudioElement {
			return new Audio('../dist/scanner.mp3')
		},
		startScan() {
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
					}, 1700);
				}, 1700);
			}, 1500);

			
		}
	}
})
</script>

<style scoped>
:root {
	--amethyst: #9950cc;
	--scanner-red: #a8030b;
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
	animation: grid-background-change 1.5s linear forwards;
}

.grid-bars-container {
	position: absolute;
	top: 0;
	left: 0;
	display: flex;
	justify-content: space-between;
	flex-wrap: wrap;
	height: 100vh;
	width: 100vw;
}

.grid-bar {
	box-sizing: border-box;
	width: 24.9%;
	height: 12.35%;
	background-color: black;
	z-index: 6;
}
/* 
.grid-bar:nth-child(n+17) {
	height: 20%;
} */

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

.sc-button-container {
	z-index: 20;
	display: flex; 
	justify-content: center; 
	align-items: center; 
	height: 100vh;
}

.sc-button {
	height: 150px;
	width: 275px;
	color: white;
	background-color: black;
	/* background-color: rgba(153, 81, 205, 0.6); */
	filter: brightness(150%);
	cursor: pointer;
	position: relative;
	border-top: 4px solid #9950cc;
	border-bottom: 4px solid #9950cc;
	border-right: 0;
	border-left: 0;
	font-size: 24px;
	font-family: 'Star Wars';
}

.sc-button:before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	height: 60%;
	width: 4px;
	background-color: #9950cc;
}

.sc-button:after {
	content: "";
	position: absolute;
	bottom: 0;
	right: 0;
	height: 60%;
	width: 4px;
	background-color: #9950cc;
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