<script setup lang="ts">

import {ConnectionLineProps, getSmoothStepPath} from "@vue-flow/core";
import {computed} from "vue";

const props = defineProps<ConnectionLineProps>()
console.log("LINE 0", props)
const path = computed(() => getSmoothStepPath(props))
let color = "var(--vscode-editorLineNumber-foreground)"
// --vscode-charts-red: #ff6188;
// --vscode-charts-blue: #78dce8;
// --vscode-charts-yellow: #ffd866;
// --vscode-charts-orange: #fc9867;
// --vscode-charts-green: #a9dc76;
// --vscode-charts-purple: #ab9df2;
if (props?.sourceHandle?.id) {
	switch (props.sourceHandle.id) {
		case "Connection":
			console.log("Connection")
			color = "var(--vscode-charts-green)"
			break
	}
}

</script>

<template>
	<g>
		<path
			class="vue-flow__edge-interaction"
			fill="none"
			:stroke="color"
			:stroke-width="2"
			:d="`M${props.sourceX},${props.sourceY}  ${props.sourceX} ${props.targetY} ${props.sourceX} ${props.targetY} ${props.targetX},${props.targetY}`"
		/>

	</g>
</template>


<style scoped>

</style>
