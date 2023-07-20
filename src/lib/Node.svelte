<script lang="ts">
	import { onMount } from "svelte";
	import Anchor from "./Anchor.svelte";
	import type NodeManager from "./NodeManager.svelte";
	import { Vec } from "./utils.js";

	let main: HTMLElement;

	export let inputs: { [id: string]: any };
	export let outputs: { [id: string]: any };
	
	export let pos: Vec;
	export let type: ConstructorOfATypedSvelteComponent;
	export let nodeId: string;

	export let updateConnection: (toNodeId: string, toAnchorId: string, val: any) => void;
	export let grabbing: (nodeId: string, anchorId: string, input: boolean, val: any) => void;
	export let dropping: (nodeId: string, anchorId: string, input: boolean, val: any) => void;

	export let grabNode: (nodeId: string, connectedInputs: Array<GrabAnchorData>) => void;

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

	let inputAnchors: { [id: string]: HTMLElement } = {};
	let outputAnchors: { [id: string]: HTMLElement } = {};

	let inputContainer: HTMLElement;
	let outputContainer: HTMLElement;

	export function getAnchorPos(id: string, input: boolean): Vec {
		let anchor: HTMLElement;
		let offset: Vec;
		if (input) {
			anchor = inputAnchors[id];
			offset = new Vec(inputContainer.offsetLeft, inputContainer.offsetTop);
		} else {
			anchor = outputAnchors[id];
			offset = new Vec(outputContainer.offsetLeft, outputContainer.offsetTop);
		}
		if (anchor) {
			return new Vec(anchor.offsetLeft + anchor.offsetWidth*0.5, anchor.offsetTop + anchor.offsetHeight*0.5).add(offset);
		}
		return new Vec(0, 0);
	}

	let inputChanged: (id: string, val: any) => void;

	let node: ATypedSvelteComponent;

	interface GrabAnchorData {
		id: string;
		input: boolean;
		pos: Vec;
	}

	onMount(() => {
		// console.log(node)
	})
	
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<main 
	bind:this={main} 
	class="main"
	style={`left: ${pos.x}px; top: ${pos.y}px;`} 
	on:mousedown={ e => { if (e.target === main) grabNode(nodeId, trackedInputConnections.map((x) => { 
			return { id: x.toAnchorId, input: true, pos: new Vec(0,0) } 
		}).concat(connections.map((x) => {
			return { id: x.fromAnchorId, input: false, pos: new Vec(0,0) }
		}))) } }>

	{nodeId}
	<svelte:component bind:this={node} this={type} bind:inputs={inputs} bind:outputs={outputs} outputChanged={outputChanged} bind:inputChanged={inputChanged}></svelte:component>
	{#if inputs && outputs}
		<div bind:this={inputContainer} class="anchors inputs">
			{#each Object.entries(inputs) as [id, val]}
				<Anchor 
					bind:main={inputAnchors[id]}
					grabbing={() => { grabbing(nodeId, id, true, undefined) }}
					dropping={() => { dropping(nodeId, id, true, undefined) }}
				/>
			{/each}
		</div>
		<div bind:this={outputContainer} class="anchors outputs">
			{#each Object.entries(outputs) as [id, val]}
				<Anchor
					bind:main={outputAnchors[id]}
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