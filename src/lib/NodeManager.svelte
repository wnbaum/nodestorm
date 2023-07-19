<script lang="ts">
	import { setContext } from "svelte";
	import Node from "./Node.svelte";
	import { Vec } from "./utils.js";

	interface NodeData {
		id: string;
		node: ConstructorOfATypedSvelteComponent;
		pos: Vec;
	}

	let nodes: Array<NodeData> = [];
	let nodeComponents: { [id: string]: Node } = {};

	interface LineData {
		fromId: string;
		fromAnchorId: string;
		toId: string;
		toAnchorId: string;
		start: Vec;
		end: Vec;
	}

	let lines: Array<LineData> = [];

	let nodeTypes: { [type: string]: ConstructorOfATypedSvelteComponent } = {};

	let uid = 0;
	function getUniqueId() {
		return uid++;
	}

	async function addNode(type: string, pos: Vec) {
		let node: ConstructorOfATypedSvelteComponent;
		if (type in nodeTypes) {
			node = nodeTypes[type]
		} else {
			node = (await import(`./${type}.svelte`)).default;
		}
		nodes.push({id: type + getUniqueId(), node: node, pos: pos});
		nodes = nodes;
	}

	function addLine(lineData: LineData): void {
		lines.push(lineData)
	}

	function connect(outputNode: string, outputId: string, outputVal: any, inputNode: string, inputId: string) {
		let inputOpen: boolean = nodeComponents[inputNode].checkInputOpen(inputId);
		if (inputOpen) {
			let added: boolean = nodeComponents[outputNode].addConnection(outputId, inputNode, inputId, outputVal)
			if (added) {
				nodeComponents[inputNode].trackInputConnection(outputNode, outputId, inputId)
				// addLine({ fromId: outputNode, fromAnchorId: outputId, toId: inputNode, toAnchorId: inputId, start: , end:  })
			}
		}
	}

	function updateConnection(toNodeId: string, toAnchorId: string, val: any): void {
		nodeComponents[toNodeId].doInputChanged(toAnchorId, val);
	}

	interface AnchorData {
		nodeId: string;
		anchorId: string;
		input: boolean;
		val?: any;
	}

	let grabbed: AnchorData | undefined;
	let dropped: AnchorData | undefined;

	function grabbing(nodeId: string, anchorId: string, input: boolean, val: any): void {
		grabbed = { nodeId: nodeId, anchorId: anchorId, input: input, val: val }
	}

	function dropping(nodeId: string, anchorId: string, input: boolean, val: any): void {
		dropped = { nodeId: nodeId, anchorId: anchorId, input: input, val: val }

		if (grabbed && dropped && grabbed.nodeId != dropped.nodeId) {
			if (grabbed.input && !dropped.input) { // grabbed input dropped output
				connect(dropped.nodeId, dropped.anchorId, dropped.val, grabbed.nodeId, grabbed.anchorId)
			} else if (!grabbed.input && dropped.input) { // grabbed output dropped input
				connect(grabbed.nodeId, grabbed.anchorId, grabbed.val, dropped.nodeId, dropped.anchorId)
			} else {
				grabbed = undefined;
				dropped = undefined;
			}
		} else {
			grabbed = undefined;
			dropped = undefined;
		}
	}

	addNode("TestNode", new Vec(0, 0))
	addNode("TestNode", new Vec(200, 200))
	addNode("TestNode", new Vec(0, 200))
</script>

<main class="main">
	{#each nodes as n (n.id)}
		<Node bind:this={nodeComponents[n.id]} updateConnection={updateConnection} grabbing={grabbing} dropping={dropping} pos={n.pos} type={n.node} nodeId={n.id}/>
	{/each}
	{#each lines as l (l.fromId + "." + l.fromAnchorId + "-" + l.toId + "." + l.toAnchorId)}

	{/each}
</main>

<style>
	.main {
		position: absolute;
		width: 0px;
		height: 0px;
	}
</style>