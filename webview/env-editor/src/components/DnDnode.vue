<script lang="ts" setup>

import DeviceCard from "./DeviceCard.vue";
import useDragAndDrop from "../core/useDnD.ts";
import {Datum} from "../types/devices";

const {onDragStart} = useDragAndDrop()
const {device} = defineProps<{
	device: Datum
}>()
</script>

<template>
	<DeviceCard :device="device" :draggable="true" minimum
				@dragstart="onDragStart($event, device.PrefabHash.toString())"></DeviceCard>
</template>

<style scoped>

</style>
