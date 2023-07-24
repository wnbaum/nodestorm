<script lang="ts">
	import * as u from "$lib/nodeutils.js"

	export const category: string = "Test";

	export let inputs: u.Anchor[] = [{ id: "in1", type: "number", val: 0 }];
	export const outputs: u.Anchor[] = [];

	export let outputChanged: (id: string) => void;

	export function inputChanged(id: string, val: any): void {
		u.set(inputs, id, val);
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
		padding: 28px;
		text-align: center;
	}
</style>