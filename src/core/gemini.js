/**
 * gemini.js (simplified)
 *
 * A minimal wrapper for Gemini chat used by bots like pokedexGeneric.
 * It:
 *  1. Creates a chat session with Gemini.
 *  2. Lets you send messages (with optional streaming).
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

export class ChatService {
  constructor({ apiKey, modelName, systemInstruction, generationConfig }) {
    if (!apiKey) throw new Error("Missing GOOGLE_API_KEY");

    this._apiKey = apiKey;
    this._modelName = modelName;
    this._systemInstruction = systemInstruction || "";
    this._generationConfig = generationConfig || {};

    this._genAI = new GoogleGenerativeAI(this._apiKey);

    this._model = null; // model handle
    this._chat = null;  // active chat session

    this._initModel();
  }

  // Create a Gemini chat session
  _initModel() {
    this._model = this._genAI.getGenerativeModel({
      model: this._modelName,
      systemInstruction: this._systemInstruction
    });

    this._chat = this._model.startChat({
      generationConfig: this._generationConfig,
      history: []
    });
  }

  /**
   * Send a prompt to the model and get back a reply.
   * Optionally stream tokens via onToken callback.
   */
  async send(prompt, { onToken } = {}) {
    const stream = await this._chat.sendMessageStream(prompt);

    for await (const chunk of stream.stream) {
      const text = chunk.text();
      if (text && onToken) onToken(text);
    }

    const response = await stream.response;
    return response.text();
  }
}
