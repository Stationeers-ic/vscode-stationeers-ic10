<script setup lang="ts">
import {onMounted, onUnmounted, ref, watch} from "vue";
import Builder from "./components/Builder.vue";
import DataProvider from "./core/DataProvider.ts";
import {off, on} from "./core/events.ts";
import type {BuilderResult} from "./types/BuilderResult.ts";
const data = ref<BuilderResult>(DataProvider.data);

const update = () => {
	console.log("DataProviderUpdate",DataProvider.data)
	data.value = DataProvider.data;

};

onMounted(() => {
	on("DataProviderUpdate",update)
});
onUnmounted(() => {
	off("DataProviderUpdate",update)
});

watch(data, (newVal) => {
	DataProvider.data = newVal;
	console.log("DataProviderUpdate",DataProvider.data)
});

</script>

<template>
	<Builder v-model="data"/>
</template>

