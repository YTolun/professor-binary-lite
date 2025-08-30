# 🧑‍🏫 Professor Binary Lite — Pokémon Terminal Bots

This project is a **step-by-step learning showcase** of how to build simple AI bots with Gemini in Node.js.  
We use a fun narrative: *Professor Binary*, a wise terminal Pokémon professor.  

The idea is to introduce someone **new to AI dev** through a clear progression:

1. **Simple Generation** — talk to Gemini with only general knowledge.  
2. **Embeddings & Vectors** — see how text becomes numbers in high-dimensional space.  
3. **Nearest Search** — find the closest KB entry by comparing embeddings.  
4. **RAG (Retrieval-Augmented Generation)** — combine embeddings with Gemini to answer questions grounded in a custom knowledge base.

---

## 📂 Project Structure

```
src/
  bots/
    pokedex-generic.js   # simple generation bot
    pokedex-kb.js        # RAG bot (general knowledge + KB grounding)
  core/
    gemini.js            # thin wrapper around Gemini API
    embeddings.js        # embedding + cosine similarity utilities
    bots.js              # registry of bots
  kb/
    megas.json           # custom KB with Mega Victreebel, Mega Hawlucha, Mega Dragonite
  tools/
    terminal.js          # minimal terminal UI
    embeddings-table.js  # demo: show embedding preview + similarities
    embeddings-nearest.js# demo: nearest-neighbor search only
```

---

## 🚀 Getting Started

1. Clone this project in [Google Cloud Shell](https://shell.cloud.google.com) or locally.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Add your Gemini API key:
   ```bash
   echo "GOOGLE_API_KEY=your_key_here" > .env
   ```
4. Run the terminal bot:
   ```bash
   npm start
   ```

---

## 🧩 Step 1 — Simple Generation

Bot: **pokedex-generic**

- Uses Gemini directly.  
- Answers only general Pokémon questions (types, moves, trivia).  
- Guardrails: refuses non-Pokémon topics.  
- Keeps answers short (≤2 sentences).

Run in terminal:
```bash
npm start
```

Try:
```
> Can you tell me about Pikachu?
```

Then try:
```
> Can you tell me about Mega Dragonite?
```

---

## 🧮 Step 2 — Embeddings (Vectors)

Now we peek *under the hood*. We take KB text (newly released Megas that wasn't in the foundation models training set) and turn it into **embeddings**: long vectors of numbers that represent meaning.

Run:
```bash
npm run rag:embeddings
```

This prints the first 8 numbers of each embedding vector.  

---

## 🔎 Step 3 — Nearest Search

We can now search the KB *without generation*.  
Query → embedding → cosine similarity against KB entries → return closest match.

Run:
```bash
npm run rag:nearest -- "mega dragonite"
```

Output:
- Shows which Mega is closest match.  
- Prints its KB entry.  
- Explains how cosine similarity was used.

💡 **Takeaway:** Embeddings let us find “nearest neighbors” by meaning, not keywords.

---

## 📚 Step 4 — RAG (Retrieval-Augmented Generation)

Bot: **pokedex-kb**

- Still general Pokémon Q&A.  
- **But**: if the question is about our Megas (Victreebel, Hawlucha, Dragonite), it retrieves from the KB and grounds the answer there.  
- Otherwise, it falls back to Gemini’s general knowledge.  
- Keeps answers short and consistent.

Run in terminal:
```
npm start
```

```
/use pokedex-kb
```

Try:
```
> Can you tell me about Mega Dragonite?
```

---

## 🎯 What You Learned

- **Simple Generation** — direct use of Gemini for Q&A.  
- **Embeddings** — how text is encoded into vectors.  
- **Nearest Search** — finding closest KB entries via cosine similarity.  
- **RAG** — combining embeddings with generation to make answers context-aware.

---

## 💡 Next Steps

- Add more KB entries (other newly released Megas, fan-made Pokémon, etc.).  
- Experiment with other Gemini models (e.g. `gemini-1.5-pro`).

---

👾 Built with ❤️ for Pokémon fans and AI learners.
