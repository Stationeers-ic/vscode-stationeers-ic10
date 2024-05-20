<script lang="ts" setup>
import {Node, useNodesData} from '@vue-flow/core'
import {Datum} from "../../../types/devices";
import DeviceCard from "../../DeviceCard.vue";

const props = defineProps<{
	id: string,
}>()

const node = useNodesData<Node<Datum>>(props.id)


</script>

<template>
	<DeviceCard v-if="node?.data" :device="node.data"/>
</template>

<style scoped>

</style>
