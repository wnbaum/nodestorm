<script lang="ts">
	import type { Category } from "./utils.js";

	export let categories: Array<Category | string>;
	export let expanded: boolean = false;
	export let name: string = "";

	export let addNode: (type: string) => void;
</script>

<main class="main">
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div on:click={() => expanded = !expanded}>{name}</div>
	{#if expanded}
		{#each categories as cat}
			{#if typeof cat != "string"}
				<svelte:self categories={cat.objects} name={cat.name} addNode={addNode} />
			{:else}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div on:click={() => {
					// @ts-ignore
					addNode(cat);
				}}>{cat}</div>
			{/if}
		{/each}
	{/if}
</main>

<style>
	.main {
		margin-left: 10px;
		cursor: default;
	}
</style>