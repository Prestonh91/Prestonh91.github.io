<template>
<main class="scanner-core">
	<div 
		class="vertical-scanner-bar"
		:class="{ 'vertical-scanner-bar-animate' : scanning, 'hidden': !scanning}"	
	></div>
	<div style="display: flex; justify-content: center; align-items: center; height: 100vh;">
		<button type="button" @click="startScan">Initiate Midi-Chlorian Scan</button>
	</div>
</main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
	data() {
		return {
			scanning: false,
		}
	},

	methods: {
		startScan() {
			this.scanning = true

			setTimeout(() => {
				this.scanning = false
			}, 3000);
		}
	}
})
</script>

<style scoped>
.scanner-core {
	height: 100vh;
	position: relative;
}

.vertical-scanner-bar {
	height: 100vh;
	width: 5vw;
	background: rgb(246,163,163);
	background: linear-gradient(90deg, rgba(246,163,163,1) 0%, rgba(232,23,24,1) 50%, rgba(246,163,163,1) 100%);
	box-shadow: 3px 0px 2px 2px #f8b7b8, -3px 0px 2px 2px #f8b7b8;
}

.vertical-scanner-bar-animate {
	animation: horizontal-scanner 3s ease-in-out forwards;
}

.hidden {
	display: none;
}

.sc-button {
	width: 175px;

}

@keyframes horizontal-scanner {
	0% {
		transform: translate(0vw);
	}
	50% {
		transform: translate(95vw);
	}
	100% {
		transform: translate(0vw);
	}
}
</style>