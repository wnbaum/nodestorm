<script lang="ts">
	import * as u from "/src/lib/nodeutils.js"

	export const category: string = "Test";

	export let inputs: u.Anchor[] = [{ id: "in1", type: "number", val: 0 }, { id: "in2", type: "number", val: 0 }]
	export const outputs: u.Anchor[] = [{ id: "out", type: "number", val: 1 }];

	export let outputChanged: (id: string) => void;

	export function inputChanged(id: string, val: any): void {
		u.set(inputs, id, val);

		u.set(outputs, "out", u.get(inputs, "in1") + u.get(inputs, "in2"));
		outputChanged("out")
	}
</script>

<main class="main">

</main>

<style>
	.main {
		width: 100px;
		height: 100px;
	}
</style>