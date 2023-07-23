<script lang="ts">
	export const category: string = "Test";

	export let inputs: { [id: string]: any } = {"in1": 0};
	export const outputs: { [id: string]: any } = {};

	export let outputChanged: (id: string) => void;

	export function inputChanged(id: string, val: any): void {
		inputs[id] = val;
		display = val;
	}

	let display = 0;
</script>

<main class="main">
	{display}
</main>

<style>
	.main {
		width: 20px;
		height: 20px;
		background: blue;
		padding: 10px;
	}
</style>