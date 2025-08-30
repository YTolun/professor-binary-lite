import "dotenv/config";
import { makeEmbedder, buildIndex } from "../core/embeddings.js";
import { loadMegas } from "./kb-loader.js";

async function main() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("❌ Missing GOOGLE_API_KEY in .env");
    process.exit(1);
  }

  const query = process.argv.slice(2).join(" ").trim();
  if (!query) {
    console.log("Usage: npm run demo:nearest -- \"your query here\"");
    process.exit(0);
  }

  // Load our knowledge base entries (Mega Victreebel, Mega Hawlucha, Mega Dragonite)
  const items = loadMegas();

  // Create an embedding function using the Gemini embedding model
  const embed = makeEmbedder(apiKey);

  // Build a simple in-memory index: each KB entry gets converted into an embedding
  const idx = await buildIndex(items, embed);

  // Convert the user's query into an embedding as well
  const qvec = await embed(query);

  // Search the index: find the 1 entry whose embedding is closest to the query
  const [hit] = idx.search(qvec, 1);

  if (!hit) {
    console.log("No match found.");
    return;
  }

  console.log(`\n🏷️ Closest: ${hit.id} (${hit.label})  score=${hit.score.toFixed(4)}\n`);
  console.log(hit.text + "\n");

  console.log(`
ℹ️  How this was calculated:
- The query was converted into an embedding (a vector of numbers).
- Each KB entry (Mega Victreebel, Mega Hawlucha, Mega Dragonite) also has an embedding.
- We compare the query embedding to each entry using cosine similarity:
    similarity = (A · B) / (||A|| * ||B||)
- The entry with the highest similarity score is returned as the "nearest" article.
  `);
}

main().catch(e => { console.error(e); process.exit(1); });
