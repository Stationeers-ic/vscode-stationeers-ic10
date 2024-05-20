import {createApp} from "vue"
import App from "./App.vue"
import DataProvider from "./core/DataProvider.ts";
import {getVscodeApi} from "./api_vscode.ts";
import PrimeVue from 'primevue/config';

window.DataProvider = DataProvider
window.api = getVscodeApi()
const app = createApp(App);
app.use(PrimeVue, {
	ripple: true,
});

app.mount("#app")
