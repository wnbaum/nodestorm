<script lang="ts">
	import type { Vec, Category } from "./utils.js";

	export let pos: Vec;

	export let main: HTMLElement;

	export let struct: Array<Category | string>;
</script>

<main bind:this={main} class="main" style={`left: ${pos.x}px; top: ${pos.y}px`}>
	<button on:click={() => console.log("e")}></button>
</main>

<style>
	.main {
		position: absolute;
		width: 100px;
		height: 100px;
		background: cyan;
	}
</style>