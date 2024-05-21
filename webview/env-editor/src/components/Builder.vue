<script lang="ts" setup>
import {type EdgeUpdateEvent, type FlowExportObject,PanelPosition,type EdgeMouseEvent, useVueFlow, VueFlow} from "@vue-flow/core"
import {onMounted, watch} from "vue"
import {grid} from "../consts.ts"
import useDragAndDrop from "./../core/useDnD"
import {Background} from '@vue-flow/background'
import Sidebar from "./Sidebar.vue"
import {MiniMap} from "@vue-flow/minimap";
import {ControlButton, Controls} from "@vue-flow/controls";
import NodeDevice from "./flow/NodeDevice.vue";
import EdgeWithButton from "./flow/EdgeWithButton.vue";

const model = defineModel<FlowExportObject | null>()
const {onConnect, addEdges, toObject, fromObject, updateEdge} = useVueFlow()
const {onDragOver, onDrop, onDragLeave, isDragOver,} = useDragAndDrop()
onConnect(addEdges)

onMounted(async () => {
	if (model.value) {
		await fromObject(model.value)
	}
})

function update() {
	model.value = toObject()
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
	updateEdge(edge, connection)
}

function onConnect2(params:any) {
	addEdges([params])
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

				@edgeUpdate="onEdgeUpdate"
				@connect="onConnect2"
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
			</VueFlow>
		</div>
	</div>
</template>
