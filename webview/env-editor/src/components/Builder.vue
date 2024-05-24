<script lang="ts" setup>
import {
	type EdgeMouseEvent,
	type EdgeUpdateEvent,
	type FlowExportObject,
	PanelPosition,
	useVueFlow,
	VueFlow
} from "@vue-flow/core"
import {onMounted, onUnmounted, watch} from "vue"
import {grid} from "../consts.ts"
import useDragAndDrop from "./../core/useDnD"
import {Background} from '@vue-flow/background'
import Sidebar from "./Sidebar.vue"
import {MiniMap} from "@vue-flow/minimap";
import {ControlButton, Controls} from "@vue-flow/controls";
import NodeDevice from "./flow/NodeDevice.vue";
import EdgeWithButton from "./flow/EdgeWithButton.vue";
import {emit, off, on} from "../core/events.ts";
import CustomConnectionLine from "./flow/CustomConnectionLine.vue";

const model = defineModel<FlowExportObject | null>()
const {onConnect, addEdges, toObject, fromObject, updateEdge} = useVueFlow()
const {onDragOver, onDrop, onDragLeave, isDragOver,} = useDragAndDrop()
onConnect(addEdges)

onMounted(async () => {
	if (model.value) {
		await fromObject(model.value)
	}
	on('update', save)
})

onUnmounted(() => {
	off('update', save)
})

function save() {
	console.log('save')
	model.value = toObject()
}

function update() {
	emit('update')
}

async function clear() {
	await fromObject({
		nodes: [],
		edges: [],
		position: [0, 0],
		zoom: 0,
		viewport: {
			zoom: 0,
			x: 0,
			y: 0,
		}
	})
	update()
}

watch(model, async (newVal) => {
	if (newVal) {
		await fromObject(newVal)
	}
})


function onEdgeUpdateStart(edge: EdgeMouseEvent) {
	console.log('start update', edge)
}

function onEdgeUpdateEnd(edge: EdgeMouseEvent) {
	console.log('end update', edge)
}

function onEdgeDbClick(edge: EdgeMouseEvent) {
	console.log('end update', edge)
}

function onEdgeUpdate({edge, connection}: EdgeUpdateEvent) {
	console.log('onEdgeUpdate', edge, connection)
	updateEdge(edge, connection)
}

function connectStart(params: any) {
	console.log("connectStart", params)

}

function connectEnd() {
	setTimeout(update, 200)
}

const pos = PanelPosition.TopRight
</script>

<template>
	<div class="ic10Editor" @drop="onDrop">
		<Sidebar/>
		<div
			class="ic10Editor__wrapper"
			style="display: flex; height: 100%; width: 100%"
			@dragleave="onDragLeave"
			@dragover="onDragOver"
		>
			<VueFlow
				:auto-connect="true"
				:snapGrid="[grid, grid]"
				:snapToGrid="true"
				fit-view-on-init
				@update:nodes="update"
				@update:edges="update"
				@node-drag-stop="update"

				@connectStart="connectStart"
				@connectEnd="connectEnd"

				@edgeUpdate="onEdgeUpdate"
				@edgeUpdateStart="onEdgeUpdateStart"
				@edgeUpdateEnd="onEdgeUpdateEnd"
				@edgeDoubleClick="onEdgeDbClick"
			>
				<MiniMap/>
				<Background :class="isDragOver ? 'ic10Editor__dropzone active' : 'ic10Editor__dropzone'" :gap="grid"
							:size="2"/>
				<Controls :position="pos">
					<ControlButton title="Remove all !!" @click="clear">
						<i class="codicon codicon-flame"/>
					</ControlButton>
				</Controls>
				<!--suppress VueUnrecognizedSlot -->
				<template #node-device="{ id }">
					<NodeDevice :id="id"/>
				</template>
				<!--suppress VueUnrecognizedSlot -->
				<template #edge-default="buttonEdgeProps">
					<EdgeWithButton
						:id="buttonEdgeProps.id"
						:source-x="buttonEdgeProps.sourceX"
						:source-y="buttonEdgeProps.sourceY"
						:target-x="buttonEdgeProps.targetX"
						:target-y="buttonEdgeProps.targetY"
						:source-position="buttonEdgeProps.sourcePosition"
						:target-position="buttonEdgeProps.targetPosition"
						:marker-end="buttonEdgeProps.markerEnd"
						:style="buttonEdgeProps.style"
					/>
				</template>
				<template
					#connection-line="{ sourceX, sourceY, targetX, targetY, sourceHandle, sourceNode, targetNode, targetHandle, connectionStatus, sourcePosition, targetPosition,markerStart,markerEnd}">
					<CustomConnectionLine :source-x="sourceX"
										  :source-y="sourceY"
										  :target-x="targetX"
										  :target-y="targetY"
										  :sourceHandle="sourceHandle"
										  :sourceNode="sourceNode"
										  :targetNode="targetNode"
										  :targetHandle="targetHandle"
										  :connectionStatus="connectionStatus"
										  :sourcePosition="sourcePosition"
										  :targetPosition="targetPosition"
										  :markerStart="markerStart"
										  :markerEnd="markerEnd"


					/>
				</template>
			</VueFlow>
		</div>
	</div>
</template>
