<script setup lang="ts">

import DeviceCard from "./DeviceCard.vue";
import useDragAndDrop from "../core/useDnD.ts";
import {Datum} from "../types/devices";

const {onDragStart} = useDragAndDrop()
const {device} = defineProps<{
	device:Datum
}>()
</script>

<template>
	<DeviceCard minimum :device="device" :draggable="true" @dragstart="onDragStart($event, device.PrefabHash.toString())"></DeviceCard>
</template>

<style scoped>

</style>
