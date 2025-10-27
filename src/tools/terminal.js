import 'dotenv/config';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { pokedexGeneric } from '../bots/pokedex-generic.js';
import { pokedexKb } from '../bots/pokedex-kb.js';

const API_KEY = process.env.GOOGLE_API_KEY;
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

if (!API_KEY) {
  console.error('❌ Missing GOOGLE_API_KEY in .env');
  process.exit(1);
}

// Get bot type from command line argument
const botType = process.argv[2];
const availableBots = {
  generic: pokedexGeneric,
  kb: pokedexKb,
};

if (!botType || !availableBots[botType]) {
  console.error('Usage: node terminal-unified.js <bot-type>');
  console.error('Available bot types: generic, kb');
  process.exit(1);
}

const bot = availableBots[botType];

async function initBot() {
  // Every bot must implement init() + answer()
  if (typeof bot.init !== 'function' || typeof bot.answer !== 'function') {
    console.error(`Bot "${bot.id}" must implement init() and answer().`);
    process.exit(1);
  }
  await bot.init({ apiKey: API_KEY, defaultModel: DEFAULT_MODEL });
}

function printHelp() {
  console.log(
    `
Commands:
  /help             Show this help
  /quit             Exit
`.trim()
  );
}

async function main() {
  await initBot();
  console.log(`🎮 ${bot.name} ready!  |  Model: ${DEFAULT_MODEL}`);
  console.log('Type your question or /help\n');

  const rl = readline.createInterface({ input, output });

  while (true) {
    const q = await rl.question('> ');
    if (!q.trim()) continue;

    if (q.startsWith('/')) {
      const cmd = q.trim();

      if (cmd === '/quit') break;
      if (cmd === '/help') {
        printHelp();
        continue;
      }

      console.log('Unknown command. Try /help');
      continue;
    }

    // Optional fast-fail
    const short = bot.precheck?.(q);
    if (short) {
      console.log(short);
      continue;
    }

    try {
      let first = true;
      const full = await bot.answer(q, {
        onToken: (t) => {
          if (first) {
            process.stdout.write('\n');
            first = false;
          }
          process.stdout.write(t);
        },
      });
      if (first) console.log('\n' + full + '\n');
      else console.log('\n');
    } catch (e) {
      console.error('⚠️  Error:', e.message || e);
    }
  }

  rl.close();
  process.exit(0);
}

main();
