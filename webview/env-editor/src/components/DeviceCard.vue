<script lang="ts" setup>
import {Datum} from "../types/devices";

const props = defineProps<{
	device: Datum
	minimum?: boolean
}>()
const image = `https://assets.ic10.dev/${props.device.image}`
</script>

<template>
	<Card :class="[{minimum:props.minimum},{normal:!props.minimum}, 'deviceCard']">
		<template v-if="!props.minimum" #header>
			<div class="image">
				<img :alt="device.Title" :src="image"/>
			</div>
		</template>
		<template v-if="!props.minimum" #title>
			{{ props.device.Title }}
		</template>
		<template v-if="!props.minimum" #content>
			<p class="m-0">
			</p>
		</template>
		<template v-else #content>
			<Avatar :image="image" :pt="{image:{loading: 'lazy'}}" loading="lazy"/>
			{{ props.device.Title }}
		</template>
	</Card>
</template>
