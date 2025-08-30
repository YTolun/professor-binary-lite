import "dotenv/config";
import { makeEmbedder, buildIndex } from "../core/embeddings.js";
import { loadMegas } from "./kb-loader.js";

async function main() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("❌ Missing GOOGLE_API_KEY in .env");
    process.exit(1);
  }

  const items = loadMegas();
  const embed = makeEmbedder(apiKey);
  const idx = await buildIndex(items, embed);

  // Print a readable table showing first 8 dims of the vector
  // Use console.table for simplicity.
  const rows = idx.entries.map(e => ({
    id: e.id,
    name: e.label,
    dims: e.vec.length,
    v0: e.vec[0]?.toFixed(4),
    v1: e.vec[1]?.toFixed(4),
    v2: e.vec[2]?.toFixed(4),
    v3: e.vec[3]?.toFixed(4),
    v4: e.vec[4]?.toFixed(4),
    v5: e.vec[5]?.toFixed(4),
    v6: e.vec[6]?.toFixed(4),
    v7: e.vec[7]?.toFixed(4)
  }));

  console.log("\n📊 Embedding preview (first 8 dimensions):\n");
  console.table(rows);

  console.log(`
ℹ️  What you’re seeing:
Each row is a Pokémon mega form.
The numbers are the first 8 values of its embedding vector (out of ~768+ dims).
Embeddings are how the model “understands” text: entries with similar meaning
will have embedding vectors that are closer together in this high-dimensional space.
  `);
}

main().catch(e => { console.error(e); process.exit(1); });
