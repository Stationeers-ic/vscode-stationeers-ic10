import { $ } from "bun"
import { dirname, join } from "path"
import fs from "node:fs/promises"

const root = dirname(__dirname)

await fs.rmdir(join(root, "dist"), { recursive: true }).catch(console.error)

await $`cd '${root}' && tsc -p tsconfig.json`.quiet().catch(console.error)
await $`cd '${root}/webview/env-editor' && bun run build`.quiet().catch(console.error)
