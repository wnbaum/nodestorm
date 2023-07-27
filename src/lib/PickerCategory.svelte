<script lang="ts">
	import type { Category } from "./utils.js";

	export let categories: Array<Category | string>;
	export let expanded: boolean = false;
	export let name: string = "";

	export let addNode: (type: string) => void;
</script>

<main class="main" data-pickeritem>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	{#if name != ""}
		<div data-pickeritem on:click={() => expanded = !expanded}>{(expanded ? "v " : "> ") + name}</div>
	{/if}
	<div class="cats" data-pickeritem>
		{#if expanded}
			{#each categories as cat}
				{#if typeof cat != "string"}
					<svelte:self categories={cat.objects} name={cat.name} addNode={addNode} />
				{:else}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div class="node" data-pickeritem on:click={() => {
						// @ts-ignore
						addNode(cat);
					}}>{cat}</div>
				{/if}
			{/each}
		{/if}
	</div>
</main>

<style>
	.main {
		cursor: default;
	}

	.cats {
		margin-left: 20px;
	}
</style>