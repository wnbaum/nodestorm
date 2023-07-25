<script lang="ts">
	import { Vec, GraphConfig, type Category } from "./utils.js";
	import { onMount } from "svelte";
	import { cameraToOffset, offsetToCamera, worldToCamera, cameraToWorld } from "./utils.js";
	import NodeManager from "./NodeManager.svelte";
	import Picker from "./Picker.svelte";

	export let config: GraphConfig = new GraphConfig();

	let main: HTMLElement;
	let transform: HTMLElement;

	let nodeManager: NodeManager;

	let cameraPos: Vec = new Vec(0, 0);
	let mousePos: Vec;
	let worldMousePos: Vec;
	let zoom: number = 1;
	let prevZoom: number = 1;

	let hovered: boolean = true;
	let shifting: boolean = false;

	let picker: HTMLElement;
	let pickerVisible: boolean = false;
	let pickerPos: Vec = new Vec(0, 0);
	let pickerWorldPos: Vec = new Vec(0, 0);

	let nodeCategories: { [type: string]: string };
	let pickerStruct: Array<Category | string> = [];

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
		if (e.target === main) {
			pickerVisible = false;
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
		if (e.target != picker) {
			e.preventDefault()
			if (!dragging) {
				zoom *= 1 - (e as WheelEvent).deltaY*0.001;
				updateGraph();
			}
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

	let keyDownManager: (e: KeyboardEvent) => void;

	function keyDown(e: KeyboardEvent) {
		if (hovered) {
			keyDownManager(e)
			if (shifting) {
				if (e.key === "A") {
					showPicker();
				}
			}
		}
		if (e.key === "Shift") {
			shifting = true;
		}
	}

	function keyUp(e: KeyboardEvent) {
		if (e.key === "Shift") {
			shifting = false;
		}
	}

	function showPicker() {
		pickerPos = mousePos;
		pickerWorldPos = worldMousePos;
		pickerVisible = true;
	}

	$: nodeCategories, makePickerStruct();

	function makePickerStruct() {
		for (let key in nodeCategories) {
			let path = nodeCategories[key];

			let split = path.split("/");
			let cat: Array<string | Category> = pickerStruct;
			for (let i = 0; i < split.length; i++) {
				let findCat: Category | undefined = cat.find(x => (x as Category).name === split[i]) as Category | undefined;
				if (findCat === undefined) {
					let newCat: Array<string | Category> = [];
					cat.push({ name: split[i], objects: newCat });
					cat = newCat;
				} else {
					cat = findCat.objects;
				}
			}
		}

		for (let key in nodeCategories) {
			let path = nodeCategories[key];

			let split = path.split("/");
			let cat: Array<string | Category> = pickerStruct;
			for (let i = 0; i < split.length; i++) {
				let findCat: Category | undefined = cat.find(x => (x as Category).name === split[i]) as Category | undefined;
				if (findCat != undefined) {
					cat = findCat.objects;
				}
			}
			cat.push(key);
		}

		pickerStruct = pickerStruct;
	}
</script>

<main bind:this={main} class="main" style="
	width: {config.width}; 
	height: {config.height}; 
	--primary: {config.style.primary.stringify()};
	--gridcolor: {config.style.gridcolor.stringify()};
	--nodecolor: {config.style.nodecolor.stringify()};
	--noderadius: {config.style.noderadius};
	--accent: {config.style.accent.stringify()};
	color: {config.style.textcolor.stringify()};
	font-family: {config.style.font}
">
	<div bind:this={transform} class="transform">
		<NodeManager bind:this={nodeManager} mousePos={mousePos} worldMousePos={worldMousePos} zoom={zoom} nodeTypes={config.nodeTypes} getAnchorColor={config.anchorColor} bind:nodeCategories={nodeCategories} bind:startSelect={startSelect} bind:keyDown={keyDownManager} bind:mouseUp={nodeMouseUp} />
	</div>
	{#if pickerVisible}
		<Picker bind:main={picker} pos={pickerPos} worldPos={pickerWorldPos} struct={pickerStruct} nodeManagerAddNode={(type, pos) => {
			nodeManager.addNode(type, pos);
			pickerVisible = false;
		}}/>
	{/if}
</main>

<style>
	.main {
		background-color: var(--primary);
		background-image: 
			linear-gradient(to right, var(--gridcolor) 1px, transparent 1px), 
			linear-gradient(to bottom, var(--gridcolor) 1px, transparent 1px);

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
