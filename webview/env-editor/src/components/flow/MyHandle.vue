<script setup lang="ts">

import {Handle, ValidConnectionFunc} from "@vue-flow/core";
import {H} from "./HandleList.vue";

const props = defineProps<{
	handle: H
}>()

const validate: ValidConnectionFunc = (connection, elements) => {
	const s = connection.source
	const t = connection.target
	if (s === t) {
		return false
	}
	const dublicate = elements.edges.find((e) => (e.source === s && e.target === t) || (e.source === t && e.target === s))
	return !dublicate;
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
