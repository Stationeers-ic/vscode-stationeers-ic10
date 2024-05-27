<script lang="ts" setup>
import { Position, useNodesData } from "@vue-flow/core"
import { Connection, Datum, DeviceNode } from "../../types/devices"
import DeviceCard from "../DeviceCard.vue"
import { onMounted, ref, watch } from "vue"
import HandleList, { H } from "./HandleList.vue"
import { getHandleId } from "../../helpers.ts"
import { emit } from "../../core/events.ts"

const props = defineProps<{
	id: string
}>()
const node = useNodesData<DeviceNode>(props.id)
const connections = ref<H[]>([])
const device = ref<Datum>()
onMounted(() => {
	const data = new Map<Connection, H>()
	device.value = __devices__.data.find((d) => d.PrefabName === node.value?.data?.PrefabName)
	console.log("device", device.value, node.value)
	if (device.value) {
		if (device.value.deviceConnectCount) {
			for (let i = 0; i < device.value.deviceConnectCount; i++) {
				if (i < device.value.deviceConnectCount / 2) {
					data.set(`port d${i}`, {
						id: getHandleId("Connection", "port", i),
						title: `d${i}`,
						position: Position.Left,
						type: "target",
						icon: "ic-icon-port_connection",
					})
				} else {
					data.set(`port d${i}`, {
						id: getHandleId("Connection", "port", i),
						title: `d${i}`,
						position: Position.Right,
						type: "target",
						icon: "ic-icon-port_connection",
					})
				}
			}
		}
		console.log("connections", device.value.connections)
		if (device.value.connections.length == 1 && device.value.connections[0] == "Connection") {
			data.set("Data Output", {
				id: getHandleId("Connection", "power_data"),
				title: "Data & Power",
				position: Position.Top,
				type: "source",
				icon: "ic-icon-power_data_connection",
			})
		} else if (
			device.value.connections.length == 2 &&
			device.value.connections[0] == "Connection" &&
			device.value.connections[1] == "Connection"
		) {
			data.set("Power Input", {
				id: getHandleId("Connection", "power"),
				title: "Power",
				position: Position.Bottom,
				type: "target",
				icon: "ic-icon-power_connection input",
			})
			data.set("Data Output", {
				id: getHandleId("Connection", "power_data"),
				title: "Data",
				position: Position.Top,
				type: "source",
				icon: "ic-icon-data_connection",
			})
		} else {
			device.value.connections.map((connection: Connection) => {
				let pos = Position.Bottom
				let icon = undefined
				let type: "source" | "target" = "source"
				if (connection == "Connection" && data.has("Connection")) {
					connection = "Power Input"
				}
				switch (connection) {
					case "Data Input":
						pos = Position.Top
						icon = "ic-icon-data_connection input"
						type = "target"
						break
					case "Data Output":
						pos = Position.Top
						icon = "ic-icon-data_connection output"
						type = "source"
						break
					case "Power Input":
						pos = Position.Bottom
						icon = "ic-icon-power_connection input"
						type = "target"
						break
					case "Power Output":
						pos = Position.Right
						icon = "ic-icon-power_connection output"
						type = "source"
						break
					case "Connection":
						pos = Position.Bottom
						icon = "codicon codicon-circle-large-filled"
						type = "source"
						break
					case "Pipe Input":
					case "Pipe Input2":
					case "Pipe Liquid Input":
					case "Pipe Liquid Input2":
						icon = "codicon codicon-arrow-circle-right input"
						pos = Position.Left
						type = "target"
						break
					case "Chute Input":
						icon = "codicon codicon-layout-activitybar-right input"
						pos = Position.Left
						type = "target"
						break
					case "Chute Output":
					case "Chute Output2":
						icon = "codicon codicon-layout-activitybar-right output"
						pos = Position.Right
						type = "source"
						break
					case "Pipe Output":
					case "Pipe Output2":
					case "Pipe Liquid Output":
					case "Pipe Liquid Output2":
					case "Pipe Waste":
						icon = "codicon codicon-arrow-circle-right output"
						pos = Position.Right
						type = "source"
						break
					case "Power And Data Input":
						pos = Position.Top
						icon = "ic-icon-power_data_connection input"
						type = "target"
						break
					case "Power And Data Output":
						pos = Position.Bottom
						icon = "ic-icon-power_data_connection output"
						type = "source"
						break
					case "Landing Pad Input":
						return
				}
				if (data.has(connection)) {
					return
				}
				data.set(connection, {
					id: getHandleId(connection),
					title: connection,
					position: pos,
					type: type,
					icon: icon,
				})
			})
		}
		if ((data.has("Data Input") || data.has("Data Output")) && data.has("Connection")) {
			data.set("Connection", {
				id: getHandleId("Connection", "power"),
				title: "Power",
				position: Position.Bottom,
				type: "target",
				icon: "ic-icon-power_connection",
			})
		}
		if (data.has("port d0")) {
			data.delete("Data Input")
			data.delete("Data Output")
			if (data.has("Connection")) {
				data.delete("Connection")
				data.set("Power Input", {
					id: getHandleId("Connection", "power"),
					title: "Power Input",
					position: Position.Bottom,
					type: "target",
					icon: "ic-icon-power_connection input",
				})
				data.set("Data Output", {
					id: getHandleId("Connection", "data"),
					title: "Data Output",
					position: Position.Top,
					type: "source",
					icon: "ic-icon-data_connection input",
				})
			}
		}
		if (data.has("Connection")) {
			data.delete("Connection")
			data.set("Data Output", {
				id: getHandleId("Connection", "data"),
				title: "Data Output",
				position: Position.Bottom,
				type: "source",
				icon: "ic-icon-data_connection input",
			})
		}

		connections.value = Array.from(data.values())
	}
})

const nodeId = ref<number>(node.value?.data?.ic10.ReferenceId ?? 0)
const nodeName = ref<string>(node.value?.data?.Name ?? "")
watch(nodeId, (newVal, oldValue) => {
	if (node.value?.data && newVal !== oldValue) {
		node.value.data.ic10.ReferenceId = nodeId.value
	}
	emit("update")
})
watch(nodeName, (newVal, oldValue) => {
	if (node.value?.data && newVal !== oldValue) {
		node.value.data.Name = nodeName.value
	}
	emit("update")
})
watch(
	() => node.value?.data?.ic10.ReferenceId,
	(newVal, oldValue) => {
		if (newVal !== oldValue) {
			nodeId.value = node.value?.data?.ic10.ReferenceId ?? 0
		}
	},
)
watch(
	() => node.value?.data?.Name,
	(newVal, oldValue) => {
		if (newVal !== oldValue) {
			nodeName.value = node.value?.data?.Name ?? ""
		}
	},
)
</script>

<template>
	<DeviceCard v-if="device" :device="device" v-model:id="nodeId" v-model:name="nodeName" />
	<HandleList :list="connections" />
</template>

<style scoped></style>
