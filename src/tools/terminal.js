import "dotenv/config";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { bots, getBotById } from "../core/bots.js";

const API_KEY = process.env.GOOGLE_API_KEY;
const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

if (!API_KEY) {
  console.error("❌ Missing GOOGLE_API_KEY in .env");
  process.exit(1);
}

let currentBot = bots[0]; // choose your default
let botReady = false;

async function attachBot(bot) {
  // Every bot must implement init() + answer()
  if (typeof bot.init !== "function" || typeof bot.answer !== "function") {
    console.error(`Bot "${bot.id}" must implement init() and answer().`);
    process.exit(1);
  }
  await bot.init({ apiKey: API_KEY, defaultModel: DEFAULT_MODEL });
  botReady = true;
}

function printHelp() {
  console.log(`
Commands:
  /help             Show this help
  /bots             List available bots
  /use <id>         Switch to a different bot
  /quit             Exit
`.trim());
}

function listBots() {
  console.log("\nAvailable bots:");
  for (const b of bots) console.log(`  - ${b.id.padEnd(18)} ${b.name} — ${b.description}`);
  console.log("");
}

async function main() {
  await attachBot(currentBot);
  console.log(`🎮 Terminal ready. Bot: ${currentBot.name}  |  Model: ${DEFAULT_MODEL}`);
  console.log("Type your question or /help\n");

  const rl = readline.createInterface({ input, output });

  while (true) {
    const q = await rl.question("> ");
    if (!q.trim()) continue;

    if (q.startsWith("/")) {
      const [cmd, ...rest] = q.trim().split(/\s+/);

      if (cmd === "/quit") break;
      if (cmd === "/help") { printHelp(); continue; }
      if (cmd === "/bots") { listBots(); continue; }

      if (cmd === "/use") {
        const id = rest.join(" ").trim();
        const next = getBotById(id);
        if (!id) { console.log("Usage: /use <id>"); continue; }
        if (!next) { console.log(`No bot with id "${id}". See /bots.`); continue; }
        currentBot = next;
        botReady = false;
        await attachBot(currentBot);
        console.log(`✅ Switched to: ${currentBot.name}`);
        continue;
      }

      console.log("Unknown command. Try /help");
      continue;
    }

    // Optional fast-fail
    const short = currentBot.precheck?.(q);
    if (short) { console.log(short); continue; }

    try {
      let first = true;
      const full = await currentBot.answer(q, {
        onToken: (t) => {
          if (first) { process.stdout.write("\n"); first = false; }
          process.stdout.write(t);
        }
      });
      if (first) console.log("\n" + full + "\n"); else console.log("\n");
    } catch (e) {
      console.error("⚠️  Error:", e.message || e);
    }
  }

  rl.close();
  process.exit(0);
}

main();
