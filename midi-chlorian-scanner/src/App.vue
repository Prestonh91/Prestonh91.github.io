<template>
<main class="scanner-core">
	<div 
		class="vertical-scanner-bar"
		:class="{ 'vertical-scanner-bar-animate' : scanning, 'hidden': !scanning}"	
	></div>
	<div
		style="display: flex; justify-content: center; align-items: center; height: 100vh;"
		:class="{ 'hidden' : scanning }"
	>
		<button class="sc-button" @click="startScan">initiate scan</button>
	</div>
	<div class="welcome-badge">Midi-Chlorian Scanner</div>
</main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

class AppData {
	scanning: Boolean = false;
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
			return new Audio('/scanner.mp3')
		},
		startScan() {
			this.scanning = true

			this.audio?.play()


			setTimeout(() => {
				this.audio?.pause()
				this.scanning = false
				this.audio = this.requestAudio()
			}, 3000);
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
	height: 100vh;
	width: 1.5vw;
	/* margin-left: 50px; */
	/* background: rgb(232,23,24); */
	background: linear-gradient(90deg, rgba(232,23,24,0.3) 0%,rgba(232,23,24,0.7) 10%, rgba(232,23,24,1) 50%, rgba(232,23,24,0.7) 90%, rgba(232,23,24,0.3) 100%);
	/* box-shadow: 3px 0px 2px 2px #f8b7b8, -3px 0px 2px 2px #f8b7b8; */
}

.vertical-scanner-bar-animate {
	animation: horizontal-scanner 3s ease-in-out forwards;
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
	right: 75px;
	font-size: 48px;
}

@keyframes horizontal-scanner {
	0% {
		transform: translate(0vw);
	}
	50% {
		transform: translate(98.5vw);
	}
	100% {
		transform: translate(0vw);
	}
}
</style>