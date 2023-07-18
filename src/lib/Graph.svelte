<script lang="ts">
	import type { Vec } from "./utils.js";
	import { onMount } from "svelte";

	export let width: number = 600;
	export let height: number = 400;

	let main: HTMLElement;

	let cameraPosition: Vec;
	let zoom: number;

	onMount(() => {
		main.addEventListener("contextmenu", (e) => e.preventDefault());
	});
</script>

<main bind:this={main} style="width: {width}px; height: {height}px; background: #444;" />

<style>
</style>
