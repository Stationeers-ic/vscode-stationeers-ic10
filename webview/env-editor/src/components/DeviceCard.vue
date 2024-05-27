<script lang="ts" setup>
import { Datum } from "../types/devices"

const name = defineModel<any>("name", { required: true })
const id = defineModel<any>("id", { required: true })

const props = defineProps<{
	device: Datum
	minimum?: boolean
}>()
const image = `https://assets.ic10.dev/${props.device.image}`
</script>

<template>
	<Card class="normal deviceCard">
		<template #header>
			<div class="image">
				<img loading="lazy" :alt="device.Title" :src="image" />
			</div>
		</template>
		<template #title>
			{{ props.device.Title }}
		</template>
		<template #content>
			<InputText placeholder="Name (Labeller)" style="width: 100%" type="text" v-model="name" />
			<InputNumber
				:pt="{
					input: {
						style: { width: '100%' },
					},
				}"
				:step="0.5"
				:minFractionDigits="0"
				:maxFractionDigits="20"
				:useGrouping="false"
				v-model="id"
			/>
		</template>
	</Card>
</template>
