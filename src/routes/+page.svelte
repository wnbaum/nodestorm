<script lang="ts">
	import Graph from "./../lib/Graph.svelte";
	import {GraphConfig} from "./../lib/utils.js"

	import Display from "./../lib/nodestorm/Display.svelte";
	import TestNode from "./../lib/nodestorm/TestNode.svelte";

	let config: GraphConfig = new GraphConfig();
	config.nodeTypes = {
		"Display": Display,
		"TestNode": TestNode
	}
</script>

<main>
	<Graph config={config}/>
</main>

<style>
</style>