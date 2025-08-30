import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function loadMegas() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const kbPath = path.join(__dirname, "..", "kb", "megas.json");
  const raw = JSON.parse(fs.readFileSync(kbPath, "utf8"));
  return raw.map(p => ({
    id: p.id,
    label: p.name,
    text: [
      p.name,
      `Typing: ${p.typing.join("/")}`,
      `Abilities: ${p.abilities.join(", ")}`,
      `Base Stats: HP ${p.baseStats.hp} Atk ${p.baseStats.atk} Def ${p.baseStats.def} SpA ${p.baseStats.spa} SpD ${p.baseStats.spd} Spe ${p.baseStats.spe}`,
      `Signature Moves: ${p.signatureMoves.join(", ")}`,
      `Flavor: ${p.flavor}`,
      `Notes: ${p.competitiveNotes}`
    ].join("\n")
  }));
}
