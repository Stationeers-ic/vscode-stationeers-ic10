import {useVueFlow} from "@vue-flow/core"
import {ref, watch} from "vue"
import {Datum} from "../types/devices";

const state = {
	/**
	 * The type of the node being dragged.
	 */
	draggedType: ref<string | null>(null),
	isDragOver: ref(false),
	dragDevice: ref<Datum | null>(null),
	isDragging: ref(false),
} as const

export default function useDragAndDrop() {
	const {draggedType, isDragOver, isDragging, dragDevice} = state

	const {addNodes, screenToFlowCoordinate, onNodesInitialized, updateNode} = useVueFlow()

	watch(isDragging, (dragging) => {
		document.body.style.userSelect = dragging ? "none" : ""
	})

	function onDragStart(event: DragEvent, device: Datum) {
		if (event.dataTransfer) {
			// event.dataTransfer.setData("application/vueflow", 'input')
			event.dataTransfer.effectAllowed = "move"
		}

		draggedType.value = 'default'
		isDragging.value = true
		dragDevice.value = device

		document.addEventListener("drop", onDragEnd)
	}

	/**
	 * Handles the drag over event.
	 *
	 * @param {DragEvent} event
	 */
	function onDragOver(event: DragEvent) {
		event.preventDefault()

		if (draggedType.value) {
			isDragOver.value = true

			if (event.dataTransfer) {
				event.dataTransfer.dropEffect = "move"
			}
		}
	}

	function onDragLeave() {
		isDragOver.value = false
	}

	function onDragEnd() {
		isDragging.value = false
		isDragOver.value = false
		draggedType.value = null
		document.removeEventListener("drop", onDragEnd)
	}

	/**
	 * Handles the drop event.
	 *
	 * @param {DragEvent} event
	 */
	function onDrop(event: DragEvent) {
		const position = screenToFlowCoordinate({
			x: event.clientX,
			y: event.clientY,
		})
		const nodeId = uuid()

		const newNode = {
			id: nodeId,
			type: `${draggedType.value}`,
			position,
			label: `[${nodeId}]`,
			ic10: {
				PrefabHash: dragDevice.value?.PrefabHash,
				props: {
					"Test": 1
				},
				slots: {}
			}
		}
		/**
		 * Align node position after drop, so it's centered to the mouse
		 *
		 * We can hook into events even in a callback, and we can remove the event listener after it's been called.
		 */
		const {off} = onNodesInitialized(() => {
			updateNode(nodeId, (node) => ({
				position: {
					x: node.position.x - node.dimensions.width / 2,
					y: node.position.y - node.dimensions.height / 2,
				},
			}))

			off()
		})
		addNodes(newNode)
	}


	return {
		draggedType,
		isDragOver,
		isDragging,
		onDragStart,
		onDragLeave,
		onDragOver,
		onDrop,
	}
}

function uuid() {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0,
			v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

