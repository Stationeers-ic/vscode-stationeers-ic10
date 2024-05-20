<script lang="ts" setup>
import {FlowExportObject, PanelPosition, useVueFlow, VueFlow} from "@vue-flow/core"
import {watch} from "vue"
import {grid} from "../consts.ts"
import useDragAndDrop from "./../core/useDnD"
import {Background} from '@vue-flow/background'
import Sidebar from "./Sidebar.vue"
import {MiniMap} from "@vue-flow/minimap";
import {ControlButton, Controls} from "@vue-flow/controls";

const model = defineModel<FlowExportObject | null>()
const {onConnect, addEdges, toObject, fromObject} = useVueFlow()
const {onDragOver, onDrop, onDragLeave, isDragOver,} = useDragAndDrop()
onConnect(addEdges)

function update() {
	model.value = toObject()
}

function clear() {
	model.value = null
}

watch(model, async (newVal) => {
	if (newVal) {
		await fromObject(newVal)
	}
})

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
				@update:nodes="update"
				@update:edges="update"
				@node-drag-stop="update"
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
