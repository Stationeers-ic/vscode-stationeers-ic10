<script lang="ts" setup>

import DeviceCard from "./DeviceCard.vue";
import useDragAndDrop from "../core/useDnD.ts";
import {Datum} from "../types/devices";

const {onDragStart} = useDragAndDrop()
const {device} = defineProps<{
	device: Datum
}>()

function _onDragStart(event: DragEvent) {
	onDragStart(event, device)
}
</script>

<template>
	<div
		:draggable="true"
		@dragstart="_onDragStart"
	>
		<DeviceCard minimum :device="device"></DeviceCard>
	</div>
</template>

<style scoped>

</style>
