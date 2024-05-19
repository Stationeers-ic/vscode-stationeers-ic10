<script setup lang="ts">
import {PanelPosition, useVueFlow, VueFlow} from "@vue-flow/core"
import {onMounted, ref, watch} from "vue"
import {grid} from "../consts.ts"
import DataProvider from "../core/DataProvider.ts"
import {BuilderResult, validateBuilderResult} from "../types/BuilderResult.ts"
import useDragAndDrop from "./../core/useDnD"
import {Background} from '@vue-flow/background'
import Sidebar from "./Sidebar.vue"
import {MiniMap} from "@vue-flow/minimap";
import {ControlButton, Controls} from "@vue-flow/controls";

const model = defineModel<BuilderResult>()

const {onConnect, addEdges} = useVueFlow()

const {onDragOver, onDrop, onDragLeave, isDragOver} = useDragAndDrop()

onConnect(addEdges)
onMounted(() => {
	elements.value = JSON.parse(JSON.stringify(model.value))
})

const elements = ref<BuilderResult>([])
watch(elements, update)

function update() {
	if (validateBuilderResult(elements.value)) {
		if (DataProvider.hasChangesData(elements.value, model.value)) {
			model.value = DataProvider.copy(elements.value)
		}
	}
}

watch(model, (newVal) => {
	if (validateBuilderResult(newVal)) {
		if (DataProvider.hasChangesData(elements.value, model.value)) {
			elements.value = DataProvider.copy(newVal)
		}
	}
})

function clear() {
	elements.value = []
}

</script>

<template>
	<div class="ic10Editor" @drop="onDrop">
		<Sidebar/>
		<div
			class="ic10Editor__wrapper"
			style="display: flex; height: 100%; width: 100%"
			@dragover="onDragOver"
			@dragleave="onDragLeave"
		>
			<VueFlow
				:auto-connect="true"
				:snapGrid="[grid, grid]"
				:snapToGrid="true"
				v-model="elements"
				@node-drag-stop="update"
			>
				<MiniMap/>
				<Background :class="isDragOver ? 'ic10Editor__dropzone active' : 'ic10Editor__dropzone'" :size="2"
							:gap="grid"/>
				<Controls :position="PanelPosition.TopRight">
					<ControlButton title="Remove all !!" @click="clear">
						<i class="codicon codicon-flame"></i>
					</ControlButton>
				</Controls>
			</VueFlow>
		</div>
	</div>
</template>
