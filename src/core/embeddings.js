/**
 * embeddings.js
 *
 * This module shows how to:
 *  1. Generate embeddings (numeric representations of text) using Gemini.
 *  2. Compare embeddings with cosine similarity.
 *  3. Build a simple in-memory "index" of knowledge base entries for retrieval.
 *
 * Think of embeddings as a way of turning text into coordinates in a high-dimensional space.
 * If two pieces of text are semantically similar, their coordinates will be close together.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * cosineSim(a, b)
 *
 * Cosine similarity is a common way to measure how close two vectors are.
 * - It computes the angle between them, not the raw distance.
 * - The result is between -1 and 1:
 *   • 1   = vectors point in exactly the same direction (very similar).
 *   • 0   = vectors are orthogonal (unrelated).
 *   • -1  = vectors point in opposite directions (very dissimilar).
 *
 * Here we use it to compare a query embedding with each knowledge base entry embedding.
 */
export function cosineSim(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];   // dot product
    na += a[i] * a[i];    // squared length of vector a
    nb += b[i] * b[i];    // squared length of vector b
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-12); // normalize lengths
}

/**
 * makeEmbedder(apiKey, model)
 *
 * Creates an async function that takes a string and returns its embedding.
 * - By default we use "text-embedding-004" (a Gemini embedding model).
 * - The returned embedding is just an array of floats (e.g. length ~768).
 *
 * Usage:
 *   const embed = makeEmbedder(apiKey);
 *   const vec = await embed("Pikachu is an Electric-type Pokémon");
 */
export function makeEmbedder(apiKey, model = "text-embedding-004") {
  if (!apiKey) throw new Error("Missing GOOGLE_API_KEY for embeddings.");
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelHandle = genAI.getGenerativeModel({ model });

  return async (text) => {
    const res = await modelHandle.embedContent({
      content: { parts: [{ text }] }
    });
    return res.embedding.values; // plain array of numbers
  };
}

/**
 * buildIndex(items, embedFn)
 *
 * Turns a list of text items into an "index" you can search.
 *
 * items: an array of objects like:
 *   { id: "mega-dragonite", label: "Mega Dragonite", text: "Full description here" }
 *
 * embedFn: a function that turns text -> embedding (from makeEmbedder).
 *
 * Returns: an object with:
 *   • entries: each item + its embedding vector.
 *   • search(queryVec, k): returns the top-k closest entries to the query vector.
 *
 * Example:
 *   const embed = makeEmbedder(apiKey);
 *   const idx = await buildIndex(myKBItems, embed);
 *   const qvec = await embed("Which mega is fastest?");
 *   const results = idx.search(qvec, 2); // top 2 matches
 */
export async function buildIndex(items, embedFn) {
  const entries = [];
  for (const it of items) {
    const vec = await embedFn(it.text); // embed the KB entry text
    entries.push({ ...it, vec });
  }

  return {
    entries,

    // Compare query vector against all entry vectors, return top-k by similarity
    search(queryVec, k = 3) {
      const scored = entries.map(e => ({
        ...e,
        score: cosineSim(queryVec, e.vec)
      }));
      scored.sort((a, b) => b.score - a.score); // highest score = most similar
      return scored.slice(0, k);
    }
  };
}
