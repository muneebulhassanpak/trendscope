import "./lib/env"

import type { SupabaseClient } from "@supabase/supabase-js"

import { runMarketSync } from "@/lib/market-data/sync"
import type { Database } from "@/lib/supabase/database.types"
import { createScriptAdminClient } from "./lib/admin-client"
import {
  demoArticles,
  demoDraftArticle,
  demoObservations,
  demoSources,
} from "./lib/demo-content"
import { requireEnv } from "./lib/env"

type Db = SupabaseClient<Database>
type Role = Database["public"]["Enums"]["user_role"]

/**
 * Idempotent demo bootstrap: market data, the read-only demo account,
 * an optional real admin, and editorial content. Safe to re-run.
 */
const db = createScriptAdminClient()

const { count } = await db
  .from("products")
  .select("id", { count: "exact", head: true })
if (!count) {
  console.log("No products yet — running market sync first")
  console.log(JSON.stringify(await runMarketSync(db, { trigger: "cli" })))
}

const demoId = await ensureUser(
  db,
  requireEnv("DEMO_USER_EMAIL"),
  requireEnv("DEMO_USER_PASSWORD"),
  "Demo Admin",
  "demo"
)

let authorId = demoId
if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
  authorId = await ensureUser(
    db,
    process.env.ADMIN_EMAIL,
    process.env.ADMIN_PASSWORD,
    "Admin",
    "admin"
  )
}

await seedEditorial(db, authorId)
console.log("Demo seed complete")

async function ensureUser(
  db: Db,
  email: string,
  password: string,
  fullName: string,
  role: Role
) {
  const { data: created, error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })

  let userId = created.user?.id
  if (error) {
    if (error.code !== "email_exists") throw error
    const { data: profile, error: lookupError } = await db
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single()
    if (lookupError) throw lookupError
    userId = profile.id
    const { error: updateError } = await db.auth.admin.updateUserById(userId, {
      password,
    })
    if (updateError) throw updateError
  }

  const { error: roleError } = await db
    .from("profiles")
    .update({ role, full_name: fullName })
    .eq("id", userId!)
  if (roleError) throw roleError

  console.log(`User ready: ${email} (${role})`)
  return userId!
}

async function seedEditorial(db: Db, authorId: string) {
  const { data: products, error: productError } = await db
    .from("products")
    .select("id, slug")
  if (productError) throw productError
  const productIds = new Map(products.map((p) => [p.slug, p.id]))
  const productId = (slug: string) => {
    const id = productIds.get(slug)
    if (!id) throw new Error(`Unknown product slug in demo content: ${slug}`)
    return id
  }

  // Sources (no natural unique key: match on URL)
  const { data: existingSources } = await db
    .from("sources")
    .select("id, url, title")
  const knownUrls = new Set(existingSources?.map((s) => s.url))
  const newSources = demoSources
    .filter((s) => !knownUrls.has(s.url))
    .map((s) => ({ ...s, created_by: authorId }))
  if (newSources.length) {
    const { error } = await db.from("sources").insert(newSources)
    if (error) throw error
  }
  const { data: sources } = await db.from("sources").select("id, title")
  const sourceIds = new Map(sources?.map((s) => [s.title, s.id]))

  // Observations: seed once
  const { count: observationCount } = await db
    .from("observations")
    .select("id", { count: "exact", head: true })
  if (!observationCount) {
    for (const o of demoObservations) {
      const { data: observation, error } = await db
        .from("observations")
        .insert({
          product_id: productId(o.product),
          author_id: authorId,
          note: o.note,
          tags: [...o.tags],
          observed_at: daysAgo(o.daysAgo),
        })
        .select("id")
        .single()
      if (error) throw error

      const links = o.sources.map((title) => ({
        observation_id: observation.id,
        source_id: sourceIds.get(title)!,
      }))
      if (links.length) {
        const { error: linkError } = await db
          .from("observation_sources")
          .insert(links)
        if (linkError) throw linkError
      }
    }
  }

  // Articles: upsert on slug, then relink products
  const articles = [
    ...demoArticles.map((a) => ({ ...a, status: "published" as const })),
    { ...demoDraftArticle, daysAgo: 0, status: "draft" as const },
  ]
  for (const a of articles) {
    const { data: article, error } = await db
      .from("articles")
      .upsert(
        {
          slug: a.slug,
          title: a.title,
          excerpt: a.excerpt,
          body: a.body,
          status: a.status,
          author_id: authorId,
          published_at: a.status === "published" ? daysAgo(a.daysAgo) : null,
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single()
    if (error) throw error

    await db.from("article_products").delete().eq("article_id", article.id)
    const { error: linkError } = await db
      .from("article_products")
      .insert(
        a.products.map((slug) => ({
          article_id: article.id,
          product_id: productId(slug),
        }))
      )
    if (linkError) throw linkError
  }
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 86_400_000).toISOString()
}
