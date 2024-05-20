<script lang="ts" setup>
import {type EdgeUpdateEvent, type FlowExportObject, PanelPosition, useVueFlow, VueFlow} from "@vue-flow/core"
import {onMounted, watch} from "vue"
import {grid} from "../consts.ts"
import useDragAndDrop from "./../core/useDnD"
import {Background} from '@vue-flow/background'
import Sidebar from "./Sidebar.vue"
import {MiniMap} from "@vue-flow/minimap";
import {ControlButton, Controls} from "@vue-flow/controls";

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

function onEdgeUpdate({edge, connection}: EdgeUpdateEvent) {
	updateEdge(edge, connection)
}
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
				@edge-update="onEdgeUpdate"
			>
				<MiniMap/>
				<Background :class="isDragOver ? 'ic10Editor__dropzone active' : 'ic10Editor__dropzone'" :gap="grid"
							:size="2"/>
				<Controls :position="PanelPosition.TopRight">
					<ControlButton title="Remove all !!" @click="clear">
						<i class="codicon codicon-flame"/>
					</ControlButton>
				</Controls>
			</VueFlow>
		</div>
	</div>
</template>
