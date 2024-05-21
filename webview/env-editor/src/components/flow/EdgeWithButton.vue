<script setup lang="ts">
import {BaseEdge, EdgeLabelRenderer, getBezierPath, type Position, useVueFlow} from '@vue-flow/core'
import {computed, CSSProperties} from 'vue'

const props = defineProps<{
	id: string,
	markerEnd?: string,
	style?: CSSProperties,
	sourceX: number
	sourceY: number
	sourcePosition?: Position
	targetX: number
	targetY: number
	targetPosition?: Position
	curvature?: number
}>();
const {removeEdges} = useVueFlow()

const path = computed(() => getBezierPath(props))
</script>


<template>
	<!-- You can use the `BaseEdge` component to create your own custom edge more easily -->
	<BaseEdge :id="props.id" :style="props.style" :path="path[0]" :marker-end="markerEnd"/>

	<!-- Use the `EdgeLabelRenderer` to escape the SVG world of edges and render your own custom label in a `<div>` ctx -->
	<EdgeLabelRenderer>
		<div
			:style="{
				pointerEvents: 'all',
				position: 'absolute',
				transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`,
     		}"
			class="nodrag nopan"
		>
			<button class="edgebutton" @click="removeEdges(id)">×</button>
		</div>
	</EdgeLabelRenderer>
</template>

<style scoped lang="scss">
.edgebutton {
	border: none;
	color: white;
	font-size: 1.5rem;
	cursor: pointer;
	padding: 0;
	margin: 0;
	position: absolute;
	top: 0;
	right: 0;
	z-index: 9999;
	transform: translate(50%, -50%);
	pointer-events: all;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 20px;
	height: 20px;
	border-radius: 50%;
	background-color: rgba(0, 0, 0, 0.5);
	transition: background-color 0.2s;

	&:hover {
		background-color: rgba(0, 0, 0, 0.8);
	}
}
</style>
