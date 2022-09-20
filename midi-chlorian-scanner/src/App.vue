<template>
<main class="scanner-core">
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
		style="display: flex; justify-content: center; align-items: center; height: 100vh;"
		:class="{ 'hidden' : horizontalScanning || verticalScanning }"
	>
		<button class="sc-button" @click="startScan">initiate scan</button>
	</div>
	<div class="welcome-badge">Midi-Chlorian Scanner</div>
</main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

class AppData {
	horizontalScanning: Boolean = false;
	verticalScanning: Boolean = false;
	audio: HTMLAudioElement | null = null;

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

	methods: {
		requestAudio(): HTMLAudioElement {
			return new Audio('../dist/scanner.mp3')
		},
		startScan() {
			this.verticalScanning = true

			this.audio?.play()

			setTimeout(() => {
				this.verticalScanning = false
				this.horizontalScanning = true 
			}, 1700);

			setTimeout(() => {
				this.horizontalScanning = false
				this.audio?.pause()
			}, 3400);
		}
	}
})
</script>

<style scoped>
:root {
	--amethyst: #9950cc;
	--scanner-red: #a8030b;
}

.scanner-core {
	height: 100vh;
	position: relative;
}

.vertical-scanner-bar {
	position: absolute;
	height: 100vh;
	width: 1.5vw;
	background: linear-gradient(90deg, rgba(232,23,24,0.3) 0%,rgba(232,23,24,0.7) 10%, rgba(232,23,24,1) 50%, rgba(232,23,24,0.7) 90%, rgba(232,23,24,0.3) 100%);
}

.horizontal-scanner-bar {
	position: absolute;
	width: 100vw;
	height: 1vh;
	background: linear-gradient(rgba(232,23,24,0.3) 0%,rgba(232,23,24,0.7) 10%, rgba(232,23,24,1) 50%, rgba(232,23,24,0.7) 90%, rgba(232,23,24,0.3) 100%);
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
		transform: translate(0, 49.5vh);
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
		transform: translate(0, -49.5vh);
	}
	100% {
		transform: translate(0, 0vh);
	}
}
</style>