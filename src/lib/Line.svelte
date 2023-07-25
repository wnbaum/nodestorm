<script lang="ts">
	import type { Vec } from "./utils.js";

	export let start: Vec;
	export let end: Vec;

	export let color: string;

	let diff: Vec;
	let len: number;
	let angle: number;


	$: start, updateDiff();
	$: end, updateDiff();

	function updateDiff() {
		diff = end.subtract(start)
		len = diff.len()
		angle = diff.angle()
	}
</script>

<main class="main" style={`left: ${start.x}px; top: ${start.y}px; width: ${len}px; transform: translate(-${len/2}px, ${-1}px) rotate(${angle}rad) translateX(${len/2}px); background: ${color}`}>

</main>

<style>
	.main {
		height: 2px;
		position: absolute;
		user-select: none;
		pointer-events: none;
	}
</style>