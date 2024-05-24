<script lang="ts" setup>

import useDragAndDrop from "../core/useDnD.ts";
import {Datum} from "../types/devices";

const {onDragStart} = useDragAndDrop()
const {device} = defineProps<{
	device: Datum
}>()
const image = `https://assets.ic10.dev/${device.image}`
function _onDragStart(event: DragEvent) {
	onDragStart(event, device)
}
</script>

<template>
	<div
		:draggable="true"
		@dragstart="_onDragStart"
	>
		<Card class="minimum deviceCard">
			<template #content>
				<Avatar :image="image" :pt="{image:{loading: 'lazy'}}" loading="lazy"/>
				{{ device.Title }}
			</template>
		</Card>
	</div>
</template>

<style scoped>

</style>
