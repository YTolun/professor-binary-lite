import { ChatService } from "../core/gemini.js";
import { buildIndex, makeEmbedder } from "../core/embeddings.js";
import { loadMegas } from "../tools/kb-loader.js";

/**
 * pokedex-kb
 * One bot that answers general Pokémon questions, but when the question
 * is about our custom megas (Victreebel, Hawlucha, Dragonite) it retrieves
 * from the KB and grounds the answer in that text.
 */

export const pokedexKb = {
  id: "pokedex-kb",
  name: "Professor Binary Lite (Knowledge-Base)",
  description:
    "General Pokémon Q&A; uses KB for Mega Victreebel, Mega Hawlucha, Mega Dragonite.",

  /**
   * Initialize once per run: build embeddings index and create a ChatService.
   */
  async init({ apiKey, defaultModel }) {
    // 1) Load KB + build vector index
    const items = loadMegas();                 // [{ id, label, text }]
    this.embed = makeEmbedder(apiKey);         // text -> embedding
    this.index = await buildIndex(items, this.embed);

    // 2) Create a dedicated ChatService owned by this bot
    this.chat = new ChatService({
      apiKey,
      modelName: defaultModel,
      systemInstruction: `
You are Professor Binary. You ONLY answer questions about Pokémon.
If a KB Entry is provided for a Mega form, use ONLY that info for that answer.
Be concise and accurate. Avoid spoilers unless asked.
`.trim(),
      generationConfig: {
        temperature: 1,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 300
      }
    });

    // tuneables
    this.simThreshold = 0.60;                  // embeddings can be modest on short queries
    this.debug = process.env.KB_DEBUG === "1"; // optional debug overlay
  },

  /**
   * Answer a user question. If it looks related to a KB mega, inject KB context.
   * Otherwise, rely on general model knowledge.
   */
  async answer(text, { onToken } = {}) {
    // --- retrieval ---------------------------------------------------------
    const qvec = await this.embed(text);
    const hits = this.index.search(qvec, 2);
    const top = hits[0];

    const shouldUseKb = top && (top.score >= this.simThreshold);

    let context = "";
  

    if (shouldUseKb) {
      context =
        `KB Entry (${top.label} • ${top.id} • score=${top.score.toFixed(3)}):\n` +
        `${top.text}\n---\n`;
    } 

    // --- prompt ------------------------------------------------------------
    // Put key rules in-turn; models obey immediate constraints better.
    const prompt = `
${context}User question: ${text}

RULES (MUST FOLLOW):
1) MAX THREEE SENTENCES total.
2) If a KB Entry is shown above, ground the answer ONLY in that KB.
3) If the KB doesn't cover it, say you're unsure in one sentence.
4) Pokémon-only; otherwise say: "I can only chat about Pokémon."
`.trim();

    const response = await this.chat.send(prompt, { onToken });
    return response
  }
};