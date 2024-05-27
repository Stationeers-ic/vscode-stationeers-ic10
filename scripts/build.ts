import { $ } from "bun"
import fs from "node:fs/promises"
import { dirname, join } from "path"

const root = dirname(__dirname)

await fs.rmdir(join(root, "dist"), { recursive: true }).catch(console.error)

await $`cd '${root}' && tsc -p tsconfig.json`.catch(console.error)
await $.cwd(`${root}/webview/env-editor`)
await $`bun run build`.catch(console.error)
