<script lang="ts">
	import type { Vec } from "./utils.js";

	export let start: Vec | undefined;
	export let end: Vec | undefined;
</script>

<main class="main" style={`left: ${start ? start.x : 0}px; top: ${start ? start.y : 0}px; width: ${start && end ? end.x - start.x : 0}px; height: ${start && end ? end.y - start.y : 0}px`}>

</main>

<style>
	.main {
		background: green;
		position: absolute;
		pointer-events: none;
	}

	.main {
		box-sizing: border-box;
		image-rendering: pixelated;
		pointer-events: none;
		position: absolute;
		width: 200px;
		height: 200px;
		background: rgba(255,255,255,0.1);
		background-image: 
			linear-gradient(to right, white 50%, transparent 50%), 
			linear-gradient(to right, white 50%, transparent 50%), 
			linear-gradient(to bottom, white 50%, transparent 50%),
			linear-gradient(to bottom, white 50%, transparent 50%);
		background-position: 
			left top, /* top */
			left bottom, /* bottom */
			left top, /* left */
			right top; /* right */
		background-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
		background-size: 
			32px 4px, 
			32px 4px, 
			4px 32px, 
			4px 32px;
		animation: bordermove 0.5s infinite linear;
	}

	@keyframes bordermove {
		from {
			background-position: 
			left top, /* top */
			left bottom, /* bottom */
			left top, /* left */
			right top; /* right */
		}

		to {
			background-position: 
			left 32px top, /* top */
			left -32px bottom, /* bottom */
			left top -32px, /* left */
			right top 32px; /* right */
		}
	}
</style>