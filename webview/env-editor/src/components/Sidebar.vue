<script lang="ts" setup>
import {ref} from "vue";
import {Datum} from "../types/devices";
import DeviceList from "./DeviceList.vue";


const housings = ref<Datum[]>([])
const structures = ref<Datum[]>([])
const items = ref<Datum[]>([])
__devices__.data.forEach((device: Datum) => {
	if (device.tags.includes('hasChip')) {
		housings.value.push(device)
		return;
	}
	if (device.tags.includes("structure")) {
		structures.value.push(device)
		return;
	}
	items.value.push(device)
	return;
})
</script>

<template>
	<aside>
		<TabView lazy scrollable>
			<!--			<TabPanel header="all">-->
			<!--				<DeviceList :data="a"/>-->
			<!--			</TabPanel>-->
			<TabPanel header="Chip housing">
				<DeviceList :data="housings"/>
			</TabPanel>
			<TabPanel header="Structures">
				<DeviceList :data="structures"/>
			</TabPanel>
			<TabPanel header="Items with logics">
				<DeviceList :data="items"/>
			</TabPanel>
		</TabView>
	</aside>
</template>

<style scoped>

</style>
