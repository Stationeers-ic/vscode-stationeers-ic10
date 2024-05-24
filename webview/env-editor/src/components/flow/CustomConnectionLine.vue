<script setup lang="ts">

import {ConnectionLineProps, getSmoothStepPath} from "@vue-flow/core";
import {computed} from "vue";
import {matchColor, parseHandleId} from "../../helpers.ts";

const props = defineProps<ConnectionLineProps>()
console.log("LINE 0", props)
const path = computed(() => getSmoothStepPath(props))
const {normal} = parseHandleId(props.sourceHandle?.id)
const color = matchColor(normal)
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
