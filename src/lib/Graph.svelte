<script lang="ts">
	import { Vec, type GraphConfig } from "./utils.js";
	import { onMount } from "svelte";
	import { cameraToOffset, offsetToCamera, worldToCamera, cameraToWorld } from "./utils.js";
	import NodeManager from "./NodeManager.svelte"

	export let width: number = 1280;
	export let height: number = 720;

	export let config: GraphConfig;

	let main: HTMLElement;
	let transform: HTMLElement;

	let cameraPos: Vec = new Vec(0, 0);
	let mousePos: Vec;
	let worldMousePos: Vec;
	let zoom: number = 1;
	let prevZoom: number = 1;

	let hovered: boolean = true;

	onMount(() => {
		main.addEventListener("contextmenu", (e) => e.preventDefault());
		main.addEventListener("mousedown", mouseDown);
		main.addEventListener("mousemove", mouseMove);
		main.addEventListener("mouseup", mouseUp);
		main.addEventListener("mousewheel", mouseWheel);
		window.addEventListener("keydown", keyDown);
		
		main.addEventListener("mouseenter", () => hovered = true);
		main.addEventListener("mouseleave", () => hovered = false);

		updateGraph()
	});

	//#region Dragging graph

	let dragging: boolean;
	let dragDown: Vec;
	let dragDownCameraPos: Vec;

	let startSelect: (selectDown: Vec) => void;
	function getMousePos(e: MouseEvent): Vec {
		let rect: DOMRect = main.getBoundingClientRect();
		return new Vec(e.pageX, e.pageY).subtract(new Vec(rect.left, rect.top));
	}

	function mouseDown(e: MouseEvent) {
		if (e.button == 2 && e.target == main) {
			dragDown = getMousePos(e);
			dragDownCameraPos = cameraPos.copy();
			dragging = true;
		}
		if (e.button == 0 && e.target == main) {
			startSelect(cameraToWorld(offsetToCamera(getMousePos(e), main), cameraPos, zoom));
		}
	}
	
	function mouseMove(e: MouseEvent) {
		mousePos = getMousePos(e)
		worldMousePos = cameraToWorld(offsetToCamera(mousePos, main), cameraPos, zoom);

		if (dragging) {
			cameraPos = dragDownCameraPos.subtract(mousePos.subtract(dragDown).div(zoom));
			updateGraph()
		}
	}

	let nodeMouseUp: () => void;

	function mouseUp(e: MouseEvent) {
		dragging = false;
		nodeMouseUp();
	}

	function mouseWheel(e: Event) {
		e.preventDefault()
		if (!dragging) {
			zoom *= 1 - (e as WheelEvent).deltaY*0.001;
			updateGraph();
		}
	}

	let keyDownManager: (e: KeyboardEvent) => void;

	function keyDown(e: KeyboardEvent) {
		if (hovered) {
			keyDownManager(e)
		}
	}

	function updateGraph() {
		if (zoom != prevZoom) {
			let ratio = zoom/prevZoom - 1;
			cameraPos = cameraPos.add(offsetToCamera(mousePos, main).scale(ratio).div(zoom));
		}

		prevZoom = zoom;

		let bgPos: Vec = cameraToOffset(worldToCamera(new Vec(0, 0), cameraPos, zoom), main);

		main.style.setProperty("background-position", `${bgPos.x}px ${bgPos.y}px`);
		main.style.setProperty("background-size", `${40*zoom}px ${40*zoom}px`);

		transform.style.setProperty("transform", `translate(${bgPos.x}px, ${bgPos.y}px) scale(${zoom})`)
	}

	//#endregion

	
</script>

<main bind:this={main} class="main" style="width: {width}px; height: {height}px;">
	<div bind:this={transform} class="transform">
		<NodeManager mousePos={mousePos} worldMousePos={worldMousePos} zoom={zoom} bind:startSelect={startSelect} bind:keyDown={keyDownManager} bind:mouseUp={nodeMouseUp} />
	</div>
</main>

<style>
	.main {
		background: #444;
		background-image: 
			linear-gradient(to right, #ccc 1px, transparent 1px), 
			linear-gradient(to bottom, #ccc 1px, transparent 1px);

		overflow: hidden;

		position: relative;

		width: 100%;
		height: 100%;
	}

	.transform {
		width: 0px;
		height: 0px;
		position: absolute;
		left: 0;
		top: 0;
	}
</style>
