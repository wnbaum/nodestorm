<script lang="ts">
	import Node from "./Node.svelte";
	import Line from "./Line.svelte";
	import SelectBox from "./SelectBox.svelte";
	import { Vec, type GraphConfig } from "./utils.js";
	import type { ModuleNode } from "vite";

	export let mousePos: Vec;
	export let worldMousePos: Vec;
	export let zoom: number;

	interface NodeData {
		id: string;
		node: ConstructorOfATypedSvelteComponent;
		pos: Vec;
		selected: boolean;
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
	export let nodeCategories: { [type: string]: string } = {};

	let uid = 0;
	function getUniqueId() {
		return uid++;
	}

	export async function addNode(type: string, pos: Vec) {
		let node: ConstructorOfATypedSvelteComponent;
		node = nodeTypes[type]
		nodes.push({id: type + getUniqueId(), node: node, pos: pos, selected: false});
		nodes = nodes;
	}

	function addLine(lineData: LineData): void {
		lines.push(lineData);
		lines = lines;
	}

	function connect(outputNode: string, outputId: string, outputVal: any, inputNode: string, inputId: string) {
		let inputOpen: boolean = nodeComponents[inputNode].checkInputOpen(inputId);
		if (inputOpen) {
			let added: boolean = nodeComponents[outputNode].addConnection(outputId, inputNode, inputId, outputVal)
			if (added) {
				nodeComponents[inputNode].trackInputConnection(outputNode, outputId, inputId)

				let outputNodeData: NodeData | undefined = nodes.find(x => x.id == outputNode);
				let inputNodeData: NodeData | undefined = nodes.find(x => x.id == inputNode);
				
				if (inputNodeData && outputNodeData) {
					addLine({ 
						fromId: outputNode, 
						fromAnchorId: outputId, 
						toId: inputNode, 
						toAnchorId: inputId, 
						start: outputNodeData.pos.add(nodeComponents[outputNode].getAnchorPos(outputId, false)), 
						end: inputNodeData.pos.add(nodeComponents[inputNode].getAnchorPos(inputId, true))
					});
					console.log("newline")
				}
			}
		}
	}

	function updateConnection(toNodeId: string, toAnchorId: string, val: any): void {
		nodeComponents[toNodeId].doInputChanged(toAnchorId, val);
	}

	//#region Dragging node 

	let nodeGrabPos: Vec;
	let prevNodePos: Vec;
	let prevSelectedNodesData: { [id: string]: NodeData } = {};
	let grabbedNodeData: NodeData | undefined;
	let grabbedNodeAnchors: Array<GrabAnchorData>;
	let selectedNodeAnchors: { [id: string]: Array<GrabAnchorData> } = {};

	interface GrabAnchorData {
		id: string;
		input: boolean;
		pos: Vec;
	}

	function grabNode(nodeId: string) {
		nodeGrabPos = mousePos;
		grabbedNodeData = nodes.find(x => x.id == nodeId)
		if (grabbedNodeData) {
			prevNodePos = grabbedNodeData.pos;
			if (grabbedNodeData.selected) {
				nodes.forEach(n => {
					if (n.selected) {
						prevSelectedNodesData[n.id] = {...n}; // copy node data into prev selected node data
						selectedNodeAnchors[n.id] = nodeComponents[n.id].getConnectedAnchors();
					}
				});
			}
			grabbedNodeAnchors = nodeComponents[grabbedNodeData.id].getConnectedAnchors();
		}
	}

	$: mousePos, mouseMove()

	function mouseMove() {
		if (grabbedNodeData) {
			let mouseDiff: Vec = mousePos.subtract(nodeGrabPos).div(zoom)
			grabbedNodeData.pos = mouseDiff.add(prevNodePos)
			if (grabbedNodeData.selected) {
				nodes.forEach(n => {
					if (n.selected) {
						n.pos = mouseDiff.add(prevSelectedNodesData[n.id].pos)
					}
				});
			}
			nodes = nodes;

			let updateLine = (line: LineData, nodeData: NodeData | undefined, nodeAnchors: Array<GrabAnchorData>) => {
				if (line.fromId == nodeData?.id) {
					let anchor: GrabAnchorData | undefined = nodeAnchors.find(x => !x.input && x.id === line.fromAnchorId);
					if (anchor) {
						line.start = nodeData.pos.add(nodeComponents[nodeData.id].getAnchorPos(anchor.id, false));
					}
				} else if (line.toId == nodeData?.id) {
					let anchor: GrabAnchorData | undefined = nodeAnchors.find(x => x.input && x.id === line.toAnchorId);
					if (anchor) {
						line.end = nodeData.pos.add(nodeComponents[nodeData.id].getAnchorPos(anchor.id, true));
						return;
					}
				}
			}

			lines.forEach(line => {
				updateLine(line, grabbedNodeData, grabbedNodeAnchors);
			})
			if (grabbedNodeData.selected) {
				nodes.forEach(n => {
					if (n.selected) {
						lines.forEach(line => {
							updateLine(line, n, selectedNodeAnchors[n.id]);
						})
					}
				});
			}
			lines = lines;
		}

		if (selecting) {
			selectStart = new Vec(Math.min(selectDown.x, worldMousePos.x), Math.min(selectDown.y, worldMousePos.y))
			selectEnd = new Vec(Math.max(selectDown.x, worldMousePos.x), Math.max(selectDown.y, worldMousePos.y));
		}
	}

	export function mouseUp() {
		grabbedNodeData = undefined;
		grabbed = undefined;

		if (selecting) {
			nodes.forEach(n => {
				if (selectStart && selectEnd) {
					let nodeRect: DOMRect = nodeComponents[n.id].getRect();
					if (n.pos.x >= selectStart.x && n.pos.y >= selectStart.y && n.pos.x + nodeRect.width <= selectEnd.x && n.pos.y + nodeRect.height <= selectEnd.y) {
						n.selected = true;
					}
				}
			});

			nodes = nodes;

			selecting = false;
			selectStart = undefined;
			prevSelectedNodesData = {};
		}
	}

	let selecting: boolean;
	let selectDown: Vec;

	let selectStart: Vec | undefined;
	let selectEnd: Vec | undefined;

	export function startSelect(selectDownGraph: Vec) {
		selecting = true;
		selectDown = selectDownGraph;
	}

	export function keyDown(e: KeyboardEvent) {
		switch (e.key) {
			case "Escape":
				deselect();
				break;
			case "x":
				deleteSelectedNodes();
				break;
		}
	}

	function deselect() {
		nodes.forEach(n => {
			n.selected = false;
		});
		nodes = nodes;
	}

	function deleteSelectedNodes() {
		let toRemove: Array<AnchorData> = [];
		nodes.forEach(n => {
			if (n.selected) {
				let anchors: Array<GrabAnchorData> = nodeComponents[n.id].getConnectedAnchors()
				anchors.forEach(a => {
					toRemove.push({ nodeId: n.id, anchorId: a.id, input: a.input });
				})
			}
		});
		nodes.forEach(n => {
			if (!n.selected) {
				nodeComponents[n.id].removeNodes(toRemove);
			}
		})
		lines = lines.filter(l => {
			let keep: boolean = true;
			toRemove.forEach(anchor => {
				if (!anchor.input && l.fromId === anchor.nodeId && l.fromAnchorId === anchor.anchorId) {
					keep = false;
				}
				if (anchor.input && l.toId === anchor.nodeId && l.toAnchorId === anchor.anchorId) {
					keep = false;
				}
			})
			return keep;
		})
		nodes = nodes.filter(n => !n.selected);
	}

	//#endregion

	interface AnchorData {
		nodeId: string;
		anchorId: string;
		input: boolean;
		val?: any;
	}

	let grabbed: AnchorData | undefined;
	let dropped: AnchorData | undefined;

	function grabbing(button: number, nodeId: string, anchorId: string, input: boolean, val: any): void {
		if (button === 0) {
			grabbed = { nodeId: nodeId, anchorId: anchorId, input: input, val: val }
		} else if (button === 2) {
			nodeComponents[nodeId].breakConnection(anchorId, input, connections => {
				if (input) {
					connections.forEach(connection => {
						nodeComponents[connection.fromNodeId].breakOutputConnection(connection.fromAnchorId, connection.toNodeId, connection.toAnchorId);
					})
				} else {
					connections.forEach(connection => {
						nodeComponents[connection.toNodeId].breakInputConnection(connection.fromNodeId, connection.fromAnchorId, connection.toAnchorId);
					})
				}
			});
			if (input) {
				lines = lines.filter(line => line.toId != nodeId || line.toAnchorId != anchorId );
			} else {
				lines = lines.filter(line => line.fromId != nodeId || line.fromAnchorId != anchorId );
			}
		}
	}

	function dropping(button: number, nodeId: string, anchorId: string, input: boolean, val: any): void {
		if (button === 0) {
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
	}

	async function importNodes() {
		let modules = import.meta.glob("/src/lib/nodestorm/*.svelte")

		let newNodeTypes: { [type: string]: ConstructorOfATypedSvelteComponent } = {};

		for (const path in modules) {
			let mod = await modules[path]();
			// @ts-ignore
			newNodeTypes[path.slice(path.lastIndexOf("/") + 1).replace(".svelte", "")] = mod.default;
		}

		nodeTypes = newNodeTypes;
	}

	importNodes();
</script>

<main class="main">
	{#each nodes as n (n.id)}
		<Node bind:this={nodeComponents[n.id]} grabNode={grabNode} updateConnection={updateConnection} grabbing={grabbing} dropping={dropping} pos={n.pos} type={n.node} nodeId={n.id} selected={n.selected}/>
	{/each}
	{#each lines as l (l.fromId + "." + l.fromAnchorId + "-" + l.toId + "." + l.toAnchorId)}
		<Line start={l.start} end={l.end} />
	{/each}
	{#if selecting}
		<SelectBox start={selectStart} end={selectEnd} />
	{/if}
	<div class="hidden"> <!-- HACK- get node categories -->
		{#each Object.keys(nodeTypes) as type}
			<svelte:component this={nodeTypes[type]} bind:category={nodeCategories[type]}></svelte:component>
		{/each}
	</div>
</main>

<style>
	.main {
		position: absolute;
		width: 0px;
		height: 0px;
	}

	.hidden {
		display: none;
	}
</style>