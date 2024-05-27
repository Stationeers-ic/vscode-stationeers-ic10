import vue from "@vitejs/plugin-vue"
import * as fs from "fs"
import * as path from "path"
import { PrimeVueResolver } from "unplugin-vue-components/resolvers"
import Components from "unplugin-vue-components/vite"
import { defineConfig } from "vite"
import viteIntegratedPlugin from "vite-plugin-integrated"
// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		Components({
			resolvers: [PrimeVueResolver()],
		}),
		viteIntegratedPlugin({
			outDir: path.dirname(path.dirname(__dirname))+"/dist/webview/env-editor",
			templatePath: "include.ejs",
			name: "include.json",
		}),
	],
	build: {
		assetsInlineLimit: 0,
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes("DoNotUseThis")) {
						return "DoNotUseThis"
					}
					if (id.includes("node_modules")) {
						const pkgName = (id.match(/node_modules\/([^/]+)/) ?? [])[1]
						if (pkgName) return `vendor-${pkgName}`
						return "vendor"
					}
				},
			},
		},
		outDir: path.dirname(path.dirname(__dirname))+"/dist/webview/env-editor",
	},
	define: {
		__logics__: JSON.parse(
			fs
				.readFileSync(path.join(path.dirname(path.dirname(__dirname)), "src", "data", "logics.json"))
				.toString("utf-8"),
		),
		__functions__: JSON.parse(
			fs
				.readFileSync(path.join(path.dirname(path.dirname(__dirname)), "src", "data", "functions.json"))
				.toString("utf-8"),
		),
		__devices__: JSON.parse(
			fs
				.readFileSync(path.join(path.dirname(path.dirname(__dirname)), "src", "data", "devices.json"))
				.toString("utf-8"),
		),
		__constant__: JSON.parse(
			fs
				.readFileSync(path.join(path.dirname(path.dirname(__dirname)), "src", "data", "constant.json"))
				.toString("utf-8"),
		),
	},
})
