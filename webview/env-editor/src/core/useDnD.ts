import { useVueFlow } from "@vue-flow/core"
import { hash } from "ic10"
import { ref, watch } from "vue"
import { uuid } from "../helpers.ts"
import { Datum, DeviceNodeData } from "../types/devices"

const state = {
	/**
	 * The type of the node being dragged.
	 */
	draggedType: ref<string | null>(null),
	isDragOver: ref(false),
	dragDevice: ref<Datum | null>(null),
	isDragging: ref(false),
	id: ref<number>(0),
} as const

export default function useDragAndDrop(lastId?: number) {
	const { draggedType, isDragOver, isDragging, dragDevice, id } = state
	if (lastId) {
		id.value = lastId
	}
	const { addNodes, screenToFlowCoordinate, onNodesInitialized, updateNode } = useVueFlow()

	watch(isDragging, (dragging) => {
		document.body.style.userSelect = dragging ? "none" : ""
	})

	function onDragStart(event: DragEvent, device: Datum) {
		if (event.dataTransfer) {
			event.dataTransfer.setData("application/vueflow", "device")
			event.dataTransfer.effectAllowed = "move"
		}

		draggedType.value = "device"
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
		if (!dragDevice.value?.PrefabName) {
			return
		}
		if (!dragDevice.value?.PrefabHash) {
			return
		}
		const newNode: {
			id: string
			type: string
			position: { x: number; y: number }
			label: string
			data: DeviceNodeData
		} = {
			id: nodeId,
			type: `${draggedType.value}`,
			position,
			label: `[${nodeId}]`,
			data: {
				PrefabName: dragDevice.value?.PrefabName,
				Name: "",
				ic10: {
					PrefabHash: dragDevice.value?.PrefabName,
					PrefabName: hash(dragDevice.value?.PrefabName),
					ReferenceId: id.value,
					Name: 0,
				},
			},
		}
		/**
		 * Align node position after drop, so it's centered to the mouse
		 *
		 * We can hook into events even in a callback, and we can remove the event listener after it's been called.
		 */
		const { off } = onNodesInitialized(() => {
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
