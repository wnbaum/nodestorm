<script lang="ts">
	import type { Vec, Category } from "./utils.js";
	import PickerCategory from "./PickerCategory.svelte";

	export let pos: Vec;
	export let worldPos: Vec;

	export let nodeManagerAddNode: (type: string, pos: Vec) => void;

	export let main: HTMLElement;

	export let struct: Array<Category | string>;
</script>

<main bind:this={main} class="main" style={`left: ${pos.x}px; top: ${pos.y}px`}>
	<PickerCategory categories={struct} expanded={true} addNode={(type) => nodeManagerAddNode(type, worldPos)} />
</main>

<style>
	.main {
		position: absolute;
		background: cyan;
		height: 200px;
		width: 200px;
		overflow: auto;
	}
</style>