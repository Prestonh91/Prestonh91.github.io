<script setup>
import { ref } from 'vue'
import { Game } from '@classes'

const game = ref(new Game({ name: 'TESTING'}))
</script>

<template lang="pug">
section
	h1 Pug rules
	| oh yea {{ game.name }}
</template>