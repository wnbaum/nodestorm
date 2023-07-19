<script lang="ts">
	import { onMount } from "svelte";
	import Anchor from "./Anchor.svelte";
	import type NodeManager from "./NodeManager.svelte";
	import type { Vec } from "./utils.js";

	export let inputs: { [id: string]: any };
	export let outputs: { [id: string]: any };

	
	export let pos: Vec;
	export let type: ConstructorOfATypedSvelteComponent;
	export let nodeId: string;

	export let updateConnection: (toNodeId: string, toAnchorId: string, val: any) => void;
	export let grabbing: (nodeId: string, anchorId: string, input: boolean, val: any) => void;
	export let dropping: (nodeId: string, anchorId: string, input: boolean, val: any) => void;

	interface Connection {
		fromAnchorId: string;
		toNodeId: string;
		toAnchorId: string;
	};

	interface TrackedConnection {
		fromNodeId: string;
		fromAnchorId: string;
		toAnchorId: string;
	};

	let connections: Array<Connection> = [];
	let trackedInputConnections: Array<TrackedConnection> = [];
	
	export function addConnection(fromAnchorId: string, toNodeId: string, toAnchorId: string, outputVal: any): boolean {
		if (!connections.find(x => (x.fromAnchorId == fromAnchorId) && (x.toNodeId == toNodeId) && (x.toAnchorId == toAnchorId))) {
			connections.push({ fromAnchorId: fromAnchorId, toNodeId: toNodeId, toAnchorId: toAnchorId })
			updateConnection(toNodeId, toAnchorId, outputVal);
			console.log("new connection")
			return true;
		}
		return false;
	}

	export function trackInputConnection(fromNodeId: string, fromAnchorId: string, toAnchorId: string): void {
		trackedInputConnections.push({ fromNodeId: fromNodeId, fromAnchorId: fromAnchorId, toAnchorId: toAnchorId })
	}

	export function checkInputOpen(toAnchorId: string): boolean {
		return !trackedInputConnections.find(x => x.toAnchorId == toAnchorId) 
	}

	function outputChanged(id: string) {
		let connection = connections.find(x => x.fromAnchorId == id)
		if (connection) {
			updateConnection(connection.toNodeId, connection.toAnchorId, outputs[id])
		}
	}

	export function doInputChanged(id: string, val: any): void {
		if (inputs[id] != val) {
			inputChanged(id, val);
		}
	}

	let inputChanged: (id: string, val: any) => void;

	let node: ATypedSvelteComponent;

	onMount(() => {
		// console.log(node)
	})
</script>

<main class="main" style={`left: ${pos.x}px; top: ${pos.y}px;`}>
	{nodeId}
	<svelte:component bind:this={node} this={type} bind:inputs={inputs} bind:outputs={outputs} outputChanged={outputChanged} bind:inputChanged={inputChanged}></svelte:component>
	{#if inputs && outputs}
		<div class="anchors inputs">
			{#each Object.entries(inputs) as [id, val]}
				<Anchor 
					grabbing={() => { grabbing(nodeId, id, true, undefined) }}
					dropping={() => { dropping(nodeId, id, true, undefined) }}
				/>
			{/each}
		</div>
		<div class="anchors outputs">
			{#each Object.entries(outputs) as [id, val]}
				<Anchor
					grabbing={() => { grabbing(nodeId, id, false, val) }}
					dropping={() => { dropping(nodeId, id, false, val) }}
				/>
			{/each}
		</div>
	{/if}
</main>

<style>
	.main {
		padding: 20px;
		background: red;
		position: absolute;
		user-select: none;
	}

	.anchors {
		position: absolute;
		width: 20px;
		height: 100%;
		top: 0;
		display: flex;
		flex-direction: column;
		justify-content: space-around;
	}

	.inputs {
		left: 0px;
	}

	.outputs {
		right: 0px;
	}
</style>