<script lang="ts">
	import { onMount } from "svelte";
	import Anchor from "./Anchor.svelte";
	import { Vec, type FullConnection } from "./utils.js";

	let main: HTMLElement;

	export let inputs: { [id: string]: any };
	export let outputs: { [id: string]: any };
	export let defaultInputs: { [id: string]: any };
	
	export let pos: Vec;
	export let type: ConstructorOfATypedSvelteComponent;
	export let selected: boolean;
	export let nodeId: string;

	export let updateConnection: (toNodeId: string, toAnchorId: string, val: any) => void;
	export let grabbing: (button: number, nodeId: string, anchorId: string, input: boolean, val: any) => void;
	export let dropping: (button: number, nodeId: string, anchorId: string, input: boolean, val: any) => void;

	export let grabNode: (nodeId: string) => void;

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
	
	export function getAnchorType(input: boolean, anchorId: string) {
		if (input) {
			return typeof inputs[anchorId];
		} else {
			return typeof outputs[anchorId];
		}
	}

	function outputChanged(id: string) {
		let outputConnections = connections.filter(x => x.fromAnchorId == id)
		outputConnections.forEach(connection => updateConnection(connection.toNodeId, connection.toAnchorId, outputs[id]))
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

	export function getConnectedAnchors(): Array<GrabAnchorData> {
		return trackedInputConnections.map((x) => { 
			return { id: x.toAnchorId, input: true, pos: new Vec(0,0) } 
		}).concat(connections.map((x) => {
			return { id: x.fromAnchorId, input: false, pos: new Vec(0,0) }
		}));
	}

	export function getRect(): DOMRect {
		return main.getBoundingClientRect();
	}
	
	interface AnchorData {
		nodeId: string;
		anchorId: string;
		input: boolean;
		val?: any;
	}

	export function removeNodes(toRemove: Array<AnchorData>) {
		toRemove.forEach(anchor => {
			if (anchor.input) { // check outputs
				connections = connections.filter(connection => {
					return connection.toNodeId != anchor.nodeId || connection.toAnchorId != anchor.anchorId;
				})
			} else { // check inputs
				trackedInputConnections = trackedInputConnections.filter(connection => {
					return connection.fromNodeId != anchor.nodeId || connection.fromAnchorId != anchor.anchorId;
				})
			}
		})
	}

	export function breakConnection(anchorId: string, input: boolean, remove: (connections: Array<FullConnection>) => void) {
		if (input) {
			let connectionsToBreak: Array<FullConnection> = [];
			for (let connection of trackedInputConnections) {
				if (connection.toAnchorId === anchorId) {
					connectionsToBreak.push({ fromNodeId: connection.fromNodeId, fromAnchorId: connection.fromAnchorId, toNodeId: nodeId, toAnchorId: anchorId });
				}
			}
			remove(connectionsToBreak);
			trackedInputConnections = trackedInputConnections.filter(connection => connection.toAnchorId != anchorId);
			inputChanged(anchorId, defaultInputs[anchorId]);
		} else {
			let connectionsToBreak: Array<FullConnection> = [];
			for (let connection of connections) {
				if (connection.fromAnchorId === anchorId) {
					connectionsToBreak.push({ fromNodeId: nodeId, fromAnchorId: anchorId, toNodeId: connection.toNodeId, toAnchorId: connection.toAnchorId });
				}
			}
			remove(connectionsToBreak);
			connections = connections.filter(connection => connection.fromAnchorId != anchorId);
		}
	}

	export function breakOutputConnection(fromAnchorId: string, toNodeId: string, toAnchorId: string) {
		connections = connections.filter(connection => connection.fromAnchorId != fromAnchorId || connection.toNodeId != toNodeId || connection.toAnchorId != toAnchorId);
	}

	export function breakInputConnection(fromNodeId: string, fromAnchorId: string, toAnchorId: string) {
		trackedInputConnections = trackedInputConnections.filter(connection => connection.fromNodeId != fromNodeId || connection.fromAnchorId != fromAnchorId || connection.toAnchorId != toAnchorId);
		inputChanged(toAnchorId, defaultInputs[toAnchorId]);
	}

	let inputChanged: (id: string, val: any) => void;

	let node: ATypedSvelteComponent;

	interface GrabAnchorData {
		id: string;
		input: boolean;
		pos: Vec;
	}

	onMount(() => {
		defaultInputs = {...inputs}
	})
	
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<main 
	bind:this={main} 
	class={`main ${selected ? "selected" : ""}`}
	style={`left: ${pos.x}px; top: ${pos.y}px;`} 
	on:mousedown={ e => { if (e.target === main) grabNode(nodeId) } }>

	<svelte:component bind:this={node} this={type} bind:inputs={inputs} bind:outputs={outputs} outputChanged={outputChanged} bind:inputChanged={inputChanged}></svelte:component>
	{#if inputs && outputs}
		<div bind:this={inputContainer} class="anchors inputs">
			{#each Object.entries(inputs) as [id, val]}
				<Anchor 
					bind:main={inputAnchors[id]}
					grabbing={(e) => { grabbing(e.button, nodeId, id, true, undefined) }}
					dropping={(e) => { dropping(e.button, nodeId, id, true, undefined) }}
				/>
			{/each}
		</div>
		<div bind:this={outputContainer} class="anchors outputs">
			{#each Object.entries(outputs) as [id, val]}
				<Anchor
					bind:main={outputAnchors[id]}
					grabbing={(e) => { grabbing(e.button, nodeId, id, false, val) }}
					dropping={(e) => { dropping(e.button, nodeId, id, false, val) }}
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
		margin: 2px;
	}

	.anchors {
		position: absolute;
		width: 20px;
		height: 100%;
		top: 0;
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		pointer-events: none;
	}

	.inputs {
		left: 0px;
	}

	.outputs {
		right: 0px;
	}

	.selected {
		margin: 0;
		border: 2px solid yellow;
	}
</style>