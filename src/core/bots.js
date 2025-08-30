import { pokedexGeneric } from "../bots/pokedex-generic.js";
import { pokedexKb } from "../bots/pokedex-kb.js";

export const bots = [pokedexGeneric, pokedexKb];

export function getBotById(id) {
  return bots.find(b => b.id === id);
}
