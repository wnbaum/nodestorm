<script lang="ts">
	import Graph from "./../lib/Graph.svelte";
	import { GraphConfig } from "./../lib/utils.js";

	let config: GraphConfig = new GraphConfig();
</script>

<main>
	<Graph config={config} />
</main>

<style>
</style>