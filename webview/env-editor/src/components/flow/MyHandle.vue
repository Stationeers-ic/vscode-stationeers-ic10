<script setup lang="ts">

import {Handle, ValidConnectionFunc} from "@vue-flow/core";
import {H} from "./HandleList.vue";
import {type Connection} from "../../types/devices";

const props = defineProps<{
	handle: H
}>()
const validate: ValidConnectionFunc = (connection, elements) => {
	const conn = connection as {
		/** Source node id */
		source: string
		/** Target node id */
		target: string
		/** Source handle id */
		sourceHandle?: Connection | null
		/** Target handle id */
		targetHandle?: Connection | null
	}
	const s = conn.source
	const t = conn.target
	if (s === t) {
		return false
	}
	if (!conn?.targetHandle) {
		return false
	}
	if (!conn?.sourceHandle) {
		return false
	}
	// console.log("connect:", conn, elements)
	const duplicate = elements.edges.find((e) => (e.source === s && e.target === t) || (e.source === t && e.target === s))
	if (duplicate) {
		return false
	}
	if (conn.sourceHandle.startsWith("port") || conn.targetHandle.startsWith("port")) {
		if (conn.sourceHandle.startsWith("port") && ["Data Output", "Data Input", "Connection"].includes(conn.targetHandle)) {
			return true
		}
		return conn.targetHandle.startsWith("port") && ["Data Output", "Data Input", "Connection"].includes(conn.sourceHandle)
	}

	const rules: Record<Connection, Connection[]> = {
		"Chute Output": ["Chute Input"],
		"Chute Output2": ["Chute Input"],
		"Chute Input": ["Chute Output", "Chute Output2"],
		"Connection": ["Connection", "Power And Data Input", "Power And Data Output", "Power Input", "Power Output", "Data Output", "Data Input"],
		"Power And Data Input": ["Connection", "Power And Data Input", "Power And Data Output", "Power Input", "Power Output", "Data Output", "Data Input"],
		"Power And Data Output": ["Connection", "Power And Data Input", "Power And Data Output", "Power Input", "Power Output", "Data Output", "Data Input"],
		"Power Output": ["Connection", "Power And Data Input", "Power And Data Output", "Power Input", "Power Output",],
		"Power Input": ["Connection", "Power And Data Input", "Power And Data Output", "Power Input", "Power Output",],
		"Data Output": ["Connection", "Power And Data Input", "Power And Data Output", "Data Output", "Data Input"],
		"Data Input": ["Connection", "Power And Data Input", "Power And Data Output", "Data Output", "Data Input"],
		"Landing Pad Input": ["Landing Pad Input"],
		"Pipe Input": ["Pipe Output", "Pipe Output2"],
		"Pipe Input2": ["Pipe Output", "Pipe Output2"],
		"Pipe Output": ["Pipe Input", "Pipe Input2"],
		"Pipe Output2": ["Pipe Input", "Pipe Input2"],
		"Pipe Waste": ["Pipe Liquid Input", "Pipe Liquid Input2"],
		"Pipe Liquid Output": ["Pipe Liquid Input", "Pipe Liquid Input2"],
		"Pipe Liquid Output2": ["Pipe Liquid Input", "Pipe Liquid Input2"],
		"Pipe Liquid Input": ["Pipe Waste", "Pipe Liquid Output", "Pipe Liquid Output2"],
		"Pipe Liquid Input2": ["Pipe Waste", "Pipe Liquid Output", "Pipe Liquid Output2"]

	}
	return !(conn?.sourceHandle && conn?.targetHandle && !rules[conn?.sourceHandle].includes(conn?.targetHandle));
}

</script>

<template>
	<Handle :class="['MyHandle',props.handle.icon,{'icon':props.handle.icon?.length } ]" :id="props.handle.id"
			:position="props.handle.position"
			:type="props.handle.type" :is-valid-connection="validate">
		<span class="content">
			<slot></slot>
		</span>
	</Handle>
</template>

<style scoped lang="scss">
.MyHandle {
	z-index: 9999;
	position: relative !important;
	left: unset !important;
	transform: unset !important;
	top: unset !important;

	width: 10px;
	height: 10px;

	&.icon {
		background: transparent !important;
		border: none !important;
		font-size: 12px !important;

		&:before {
			width: 32px !important;
			height: 32px !important;
			position: relative !important;
			top: -25% !important;
			left: -25% !important;
		}

		.content {
			font-family: var(--monaco-monospace-font), serif !important;
		}
	}

	.content {
		text-align: left;
		width: 20em;
		pointer-events: none;
		font-family: var(--monaco-monospace-font), serif !important;
		font-size: 0.5rem;
		color: var(--vscode-activityBarTop-inactiveForeground);
		position: absolute;
		top: 10px;
		left: 10px;
	}
}


</style>
