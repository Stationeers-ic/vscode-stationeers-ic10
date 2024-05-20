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
onMounted(() => {
	if (node.value?.data) {
		if (node.value.data.deviceConnectCount) {
			for (let i = 0; i < node.value.data.deviceConnectCount; i++) {
				if (i < node.value.data.deviceConnectCount / 2) {
					connections.value.push({
						id: `d${i}`,
						title: `d${i}`,
						position: Position.Left,
						type: "target",
						icon: "ic-icon-port_connection"
					})
				} else {
					connections.value.push({
						id: `d${i}`,
						title: `d${i}`,
						position: Position.Right,
						type: "target",
						icon: "ic-icon-port_connection"
					})
				}
			}
		}
		console.log("connections", node.value.data.connections)
		node.value.data.connections.map((c: Connection) => {
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
					pos = Position.Left
					icon = "ic-icon-power_connection"
					break
				case "Power Output":
					pos = Position.Right
					icon = "ic-icon-power_connection"
					break
				case "Connection":
					pos = Position.Bottom
					break
				case "Chute Input":
				case "Pipe Input":
				case "Pipe Input2":
				case "Pipe Liquid Input":
				case "Pipe Liquid Input2":
					pos = Position.Left
					break
				case "Chute Output":
				case "Chute Output2":
				case "Pipe Output":
				case "Pipe Output2":
				case "Pipe Liquid Output":
				case "Pipe Liquid Output2":
				case "Pipe Waste":
					pos = Position.Right
					break;
				case "Power And Data Input":
					pos = Position.Top
					icon = "ic-icon-power_data_connection"
					break;
				case "Power And Data Output":
					pos = Position.Bottom
					icon = "ic-icon-power_data_connection"
					break;
				case "Landing Pad Input":
					return
			}
			connections.value.push({
				id: c,
				title: c,
				position: pos,
				type: "target",
				icon: icon
			})
		})
	}
})

</script>

<template>
	<DeviceCard v-if="node?.data" :device="node.data"/>
	<HandleList :list="connections"/>
</template>

<style scoped>

</style>
