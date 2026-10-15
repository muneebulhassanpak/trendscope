import "./lib/env"

import { runMarketSync } from "@/lib/market-data/sync"
import { createScriptAdminClient } from "./lib/admin-client"

const trigger = process.argv.includes("--schedule") ? "schedule" : "cli"

const summary = await runMarketSync(createScriptAdminClient(), { trigger })
console.log(JSON.stringify(summary))
