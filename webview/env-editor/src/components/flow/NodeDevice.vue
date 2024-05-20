<script lang="ts" setup>
import {Node, Position, useNodesData} from '@vue-flow/core'
import {Datum} from "../../types/devices";
import DeviceCard from "../DeviceCard.vue";
import {onMounted, ref} from "vue";
import HandleList, {H} from "./HandleList.vue";

const props = defineProps<{
	id: string,
}>()
const node = useNodesData<Node<Datum>>(props.id)
// const connections = ref<H[]>([])
const ports = ref<H[]>([])
onMounted(() => {
	if (node.value?.data) {
		if (node.value.data.deviceConnectCount) {
			const __ports: H[] = []
			for (let i = 0; i < node.value.data.deviceConnectCount; i++) {
				if(i < node.value.data.deviceConnectCount/2) {
					__ports.push({
						id: `d${i}`,
						title: `d${i}`,
						position: Position.Left,
						type: "target",
						icon:"ic-icon-power_connection"
					})
				}else{
					__ports.push({
						id: `d${i}`,
						title: `d${i}`,
						position: Position.Right,
						type: "target",
					})
				}
			}
			ports.value = __ports

		}
		// connections.value = node.value.data.connections
	}
})

</script>

<template>
	<DeviceCard v-if="node?.data" :device="node.data"/>
	<HandleList :list="ports"/>
</template>

<style scoped>

</style>
