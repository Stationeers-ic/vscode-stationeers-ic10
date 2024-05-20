<script lang="ts" setup>
import {Node, Position, useNodesData} from '@vue-flow/core'
import {Connection, Datum} from "../../types/devices";
import DeviceCard from "../DeviceCard.vue";
import {onMounted, ref} from "vue";
import HandleList, {H} from "./HandleList.vue";

const props = defineProps<{
	id: string,
}>()
const node = useNodesData<Node<Datum>>(props.id)
const connections = ref<H[]>([])
const ports = ref<H[]>([])
onMounted(() => {
	if (node.value?.data) {
		if (node.value.data.deviceConnectCount) {
			const __ports: H[] = []
			for (let i = 0; i < node.value.data.deviceConnectCount; i++) {
				if (i < node.value.data.deviceConnectCount / 2) {
					__ports.push({
						id: `d${i}`,
						title: `d${i}`,
						position: Position.Left,
						type: "target",
						icon: "ic-icon-port_connection"
					})
				} else {
					__ports.push({
						id: `d${i}`,
						title: `d${i}`,
						position: Position.Right,
						type: "target",
						icon: "ic-icon-port_connection"
					})
				}
			}
			ports.value = __ports

		}
		console.log("connections", node.value.data.connections)
		connections.value = node.value.data.connections.map((c: Connection) => {
			let pos = Position.Bottom
			let icon = undefined
			switch (c) {
				case "Data Input":
					pos = Position.Top
					icon = "ic-icon-data_connection"
					break
				case "Data Output":
					pos = Position.Top
					icon = "ic-icon-data_connection"
					break
				case "Power Input":
					pos = Position.Bottom
					icon = "ic-icon-power_connection"
					break
				case "Power Output":
					pos = Position.Bottom
					icon = "ic-icon-power_connection"
					break
				case "Connection":
					pos = Position.Bottom
					icon = "ic-icon-connection"
					break

			}
			return {
				id: `d${c}`,
				title: `d${c}`,
				position: pos,
				type: "target",
				icon: icon
			}
		})
	}
})

</script>

<template>
	<DeviceCard v-if="node?.data" :device="node.data"/>
	<HandleList :list="ports"/>
	<HandleList :list="connections"/>
</template>

<style scoped>

</style>
