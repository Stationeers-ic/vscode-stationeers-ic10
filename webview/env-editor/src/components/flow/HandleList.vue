<script setup lang="ts">
import { type HandleType, Position } from "@vue-flow/core"
import { onMounted, ref, watch } from "vue"
import MyHandle from "./MyHandle.vue"
import { HandleId } from "../../helpers.ts"

export type H = {
	id: HandleId
	title: string
	type: HandleType
	position: Position
	icon?: string
}
const props = defineProps<{
	list: H[]
}>()
const bottom = ref<H[]>([])
const top = ref<H[]>([])
const left = ref<H[]>([])
const right = ref<H[]>([])
onMounted(separate)

function separate() {
	bottom.value = props.list.filter((l) => l.position === Position.Bottom)
	top.value = props.list.filter((l) => l.position === Position.Top)
	left.value = props.list.filter((l) => l.position === Position.Left)
	right.value = props.list.filter((l) => l.position === Position.Right)
	console.log(props)
}

separate()
watch(props, separate)
</script>

<template>
	<div class="wrapper">
		<div class="bottom" v-if="bottom.length >= 0">
			<MyHandle v-for="conn in bottom" :handle="conn" :key="conn.id">
				{{ conn.title }}
			</MyHandle>
		</div>
		<div class="top" v-if="top.length >= 0">
			<MyHandle v-for="conn in top" :handle="conn" :key="conn.id">
				{{ conn.title }}
			</MyHandle>
		</div>
		<div class="left" v-if="left.length >= 0">
			<MyHandle v-for="conn in left" :handle="conn" :key="conn.id">
				{{ conn.title }}
			</MyHandle>
		</div>
		<div class="right" v-if="right.length >= 0">
			<MyHandle v-for="conn in right" :handle="conn" :key="conn.id">
				{{ conn.title }}
			</MyHandle>
		</div>
	</div>
</template>

<style scoped lang="scss">
.wrapper {
	top: 0;
	position: absolute;
	width: 100%;
	height: 100%;
	pointer-events: none;
}

.bottom,
.top,
.left,
.right {
	background-color: transparent;
	position: absolute;
	display: flex;
	justify-content: space-around;
}

.bottom {
	bottom: -10px;
	width: 100%;
	height: 10px;
}

.top {
	top: -10px;
	width: 100%;
	height: 10px;
}

.left {
	flex-direction: column;
	left: -10px;
	height: 100%;
	width: 10px;
}

.right {
	flex-direction: column;
	right: -10px;
	height: 100%;
	width: 10px;
}
</style>
