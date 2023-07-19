<script lang="ts">
	export let inputs: { [id: string]: any } = {"in1": 0, "in2": 0};
	export const outputs: { [id: string]: any } = {"out": 1};

	export let outputChanged: (id: string) => void;

	export function inputChanged(id: string, val: any): void {
		inputs[id] = val

		outputs["out"] = inputs["in1"] + inputs["in2"]
		outputChanged("out")
	}
</script>

<main class="main">

</main>

<style>
	.main {
		width: 100px;
		height: 100px;
		background: blue;
	}
</style>