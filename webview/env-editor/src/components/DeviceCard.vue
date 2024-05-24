<script lang="ts" setup>
import {Datum} from "../types/devices";

const props = defineProps<{
	device: Datum
	minimum?: boolean
}>()
const image = `https://assets.ic10.dev/${props.device.image}`
</script>

<template>
	<Card class="normal deviceCard">
		<template  #header>
			<div class="image">
				<img loading="lazy" :alt="device.Title" :src="image"/>
			</div>
		</template>
		<template #title>
			{{ props.device.Title }}
		</template>
		<template #content>
			<p class="m-0">

			</p>
		</template>
	</Card>
</template>
