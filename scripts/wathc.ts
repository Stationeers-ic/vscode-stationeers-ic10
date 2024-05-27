import { $ } from "bun"
import { dirname } from "path"

const root = dirname(__dirname)
await $`cd '${root}/webview/env-editor' && bun run build`.quiet().catch(console.error)
const tsc = await $`cd '${root}' && tsc -watch -p .`
