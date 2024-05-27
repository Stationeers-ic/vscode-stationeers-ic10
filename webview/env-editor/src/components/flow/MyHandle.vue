<script setup lang="ts">
import { Handle, ValidConnectionFunc } from "@vue-flow/core"
import { H } from "./HandleList.vue"
import { HandleId, NormalConnection, parseHandleId } from "../../helpers.ts"

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
		sourceHandle?: HandleId | null
		/** Target handle id */
		targetHandle?: HandleId | null
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
	const duplicate = elements.edges.filter(
		(e) => (e.source === s && e.target === t) || (e.source === t && e.target === s),
	)
	if (duplicate.length > 0) {
		const dub = duplicate.find((d) => d.sourceHandle === conn.sourceHandle && d.targetHandle === conn.targetHandle)
		if (dub) {
			return false
		}
	}

	if (conn.sourceHandle && conn.targetHandle) {
		const sourceHandle = parseHandleId(conn.sourceHandle)
		const targetHandle = parseHandleId(conn.targetHandle)
		const rules: Record<NormalConnection, NormalConnection[]> = {
			port: ["data", "power_data"],
			data: ["data", "power_data", "port"],
			power: ["power", "power_data"],
			power_data: ["power", "data", "power_data", "port"],
			gas: ["gas"],
			item: ["item"],
			liquid: ["liquid"],
			waste: ["waste"],
			Landing: ["Landing"],
			unknown: [],
		}
		return !(conn?.sourceHandle && conn?.targetHandle && !rules[sourceHandle.normal].includes(targetHandle.normal))
	}
	return false
}
</script>

<template>
	<Handle
		:class="['MyHandle', props.handle.icon, { icon: props.handle.icon?.length }]"
		:id="props.handle.id"
		:position="props.handle.position"
		:type="props.handle.type"
		:is-valid-connection="validate"
	>
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
