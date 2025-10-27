import { ChatService } from "../core/gemini.js";

/**
 * pokedex-generic
 *
 * A single-purpose Pokémon chatbot with no retrieval/RAG.
 * - Owns its own ChatService (so the terminal stays minimal).
 * - Uses ONLY the model’s general knowledge (no tools/browsing).
 * - Keeps answers short and safe for live demos.
 *
 * Lifecycle:
 *   1) init({ apiKey, defaultModel }) → create the ChatService once.
 *   2) answer(text, { onToken }) → send one turn; optionally stream tokens.
 */

export const pokedexGeneric = {
  id: "pokedex-generic",
  name: "Professor Binary Lite (Generic)",
  description: "General Pokémon Q&A (games, anime, types, moves, regions).",

  /**
   * Initialize once per run: create a ChatService dedicated to this bot.
   * - systemInstruction sets the bot’s persona & guardrails.
   * - generationConfig controls style/length/creativity.
   */
  async init({ apiKey, defaultModel }) {
    this.chat = new ChatService({
      apiKey,
      modelName: defaultModel,
      systemInstruction: `
You are Professor Binary, a friendly but wise terminal chatbot that ONLY answers questions about Pokémon.
- Allowed topics: Pokémon games, anime, manga, mechanics, types, moves, regions, Pokédex lore, strategies, history, trivia.
- If the user asks non-Pokémon things, respond briefly: "I can only chat about Pokémon."
- Use general knowledge only. Do NOT use tools, browsing, or external APIs.
- Be concise and accurate; if uncertain, say what you're unsure about.
- Avoid spoilers unless explicitly requested.
- Keep your answers brief to maximum of three sentences.
`.trim(),
      generationConfig: {
        temperature: 1,  
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 1000
      }
    });
  },

  /**
   * Answer one user turn.
   * - We repeat the “two sentences” constraint inside THIS turn’s prompt
   *   because models tend to obey immediate instructions more than only
   *   system-level ones.
   * - onToken lets the terminal stream incremental output for nicer UX.
   */
  async answer(text, { onToken } = {}) {
    // Put the (soft) style rule in-turn for stronger adherence
    const prompt = `
User question: ${text}

Answer as Professor Binary in at most two sentences.
If you are unsure, say so briefly. Pokémon-only topics.
`.trim();

    const response = await this.chat.send(prompt, { onToken });
    return response; 
  }
};