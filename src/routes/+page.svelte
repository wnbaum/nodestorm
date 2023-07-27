<script lang="ts">
	import Graph from "./../lib/Graph.svelte";
	import {GraphConfig} from "./../lib/utils.js"

	import Display from "./../lib/nodestorm/Display.svelte";
	import TestNode from "./../lib/nodestorm/TestNode.svelte";

	let config: GraphConfig = new GraphConfig();
	config.nodeTypes = {
		"Display": Display,
		"TestNode": TestNode,
		"TestNode1": TestNode,
		"TestNode2": TestNode,
		"TestNode3": TestNode,
		"TestNode4": TestNode,
		"TestNode5": TestNode,
		"TestNode6": TestNode,
		"TestNode7": TestNode,
		"TestNode8": TestNode,
		"TestNode9": TestNode,
		"TestNode12": TestNode,
		"TestNode14": TestNode,
		"TestNode13": TestNode,
	}
</script>

<main>
	<Graph config={config}/>
</main>

<style>
</style>