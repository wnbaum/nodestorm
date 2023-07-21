<script lang="ts">
	export let grabbing: (e: MouseEvent) => void;
	export let dropping: (e: MouseEvent) => void;

	export let main: HTMLElement;
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<main bind:this={main} class="main" on:mousedown={grabbing} on:mouseup={dropping}>

</main>

<style>
	.main {
		width: 20px;
		height: 20px;
		border-radius: 10px 10px;
		pointer-events: all;
		user-select: none;

		background: green;
	}
</style>