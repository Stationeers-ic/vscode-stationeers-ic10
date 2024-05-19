<script setup lang="ts">
import {Datum} from "../types/devices";

const props = defineProps<{
	device: Datum
	minimum?: boolean
}>()
const image = `https://assets.ic10.dev/${props.device.image}`
</script>

<template>
	<Card :class="[{minimum:props.minimum},{normal:!props.minimum}, 'deviceCard']">
		<template #header v-if="!props.minimum">
			<div class="image">
				<img :alt="device.Title" :src="image"/>
			</div>
		</template>
		<template #title v-if="!props.minimum">
			{{ props.device.Title }}
		</template>
		<template #content v-if="!props.minimum">
			<p class="m-0">
			</p>
		</template>
		<template #content v-else>
			<Avatar :pt="{image:{loading: 'lazy'}}" loading="lazy" :image="image"/>
			{{ props.device.Title }}
		</template>
	</Card>
</template>
