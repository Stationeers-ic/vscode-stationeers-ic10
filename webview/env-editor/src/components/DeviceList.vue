<script lang="ts" setup>

import {aside_node_height} from "../helpers.ts";
import DnDnode from "./DnDnode.vue";
import {Datum} from "../types/devices";
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import {ref} from "vue";

const {data} = defineProps<{
	data: Datum[]
}>()
const search = ref<string>('')

function filter(data: Datum) {
	if (search.value.length > 0) {
		return data.Title.toLowerCase().includes(search.value.toLowerCase()) || data.PrefabName.toLowerCase().includes(search.value.toLowerCase())
	}
	return true
}

</script>

<template>
	<div class="content">
		<div class="search">
			<IconField iconPosition="left">
				<InputIcon class="codicon codicon-search"></InputIcon>
				<InputText v-model="search" placeholder="Search"/>
			</IconField>
		</div>
		<div class="list">
			<VirtualScroller :itemSize="aside_node_height" :items="data.filter(filter)" showSpacer>
				<template v-slot:item="{ item }">
					<DnDnode :key="item.PrefabHash" :device="item"/>
				</template>
			</VirtualScroller>
		</div>
	</div>
</template>
<style scoped>
.content {
	height: calc(100vh - 105px);
	display: grid;
	grid-template-columns: 1fr;
	grid-template-rows: 50px 1fr;
	gap: 0 0;
	grid-auto-flow: row;
	grid-template-areas:
    "search"
    "list";

	.search {
		grid-area: search;
		margin: 0 auto;
	}

	.list {
		grid-area: list;
	}
}


</style>
