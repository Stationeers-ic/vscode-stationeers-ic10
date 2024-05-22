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
	const data = new Map<string, H>()
	if (node.value?.data) {
		if (node.value.data.deviceConnectCount) {
			for (let i = 0; i < node.value.data.deviceConnectCount; i++) {
				if (i < node.value.data.deviceConnectCount / 2) {
					data.set(`port d${i}`, {
						id: `port d${i}`,
						title: `d${i}`,
						position: Position.Left,
						type: "target",
						icon: "ic-icon-port_connection",
					})
				} else {
					data.set(`port d${i}`, {
						id: `port d${i}`,
						title: `d${i}`,
						position: Position.Right,
						type: "target",
						icon: "ic-icon-port_connection",
					})
				}
			}
		}
		console.log("connections", node.value.data.connections)
		node.value.data.connections.map((connection: Connection) => {
			let pos = Position.Bottom
			let icon = undefined
			switch (connection) {
				case "Data Input":
					pos = Position.Top
					icon = "ic-icon-data_connection input"
					break
				case "Data Output":
					pos = Position.Top
					icon = "ic-icon-data_connection output"
					break
				case "Power Input":
					pos = Position.Left
					icon = "ic-icon-power_connection input"
					break
				case "Power Output":
					pos = Position.Right
					icon = "ic-icon-power_connection output"
					break
				case "Connection":
					pos = Position.Bottom
					icon = "codicon codicon-circle-large-filled"
					break
				case "Pipe Input":
				case "Pipe Input2":
				case "Pipe Liquid Input":
				case "Pipe Liquid Input2":
					icon = "codicon codicon-arrow-circle-right input"
					pos = Position.Left
					break;
				case "Chute Input":
					icon = "codicon codicon-layout-activitybar-right input"
					pos = Position.Left
					break
				case "Chute Output":
				case "Chute Output2":
					icon = "codicon codicon-layout-activitybar-right output"
					pos = Position.Right
					break;
				case "Pipe Output":
				case "Pipe Output2":
				case "Pipe Liquid Output":
				case "Pipe Liquid Output2":
				case "Pipe Waste":
					icon = "codicon codicon-arrow-circle-right output"
					pos = Position.Right
					break;
				case "Power And Data Input":
					pos = Position.Top
					icon = "ic-icon-power_data_connection input"
					break;
				case "Power And Data Output":
					pos = Position.Bottom
					icon = "ic-icon-power_data_connection output"
					break;
				case "Landing Pad Input":
					return
			}
			if (data.has(connection)) {
				return
			}
			data.set(connection, {
				id: connection,
				title: connection,
				position: pos,
				type: "target",
				icon: icon,
			})
		})
		connections.value = Array.from(data.values())
	}
})

</script>

<template>
	<DeviceCard v-if="node?.data" :device="node.data"/>
	<HandleList :list="connections"/>
</template>

<style scoped>

</style>
