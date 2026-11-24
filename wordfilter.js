// wordfilter.js
// Filtro de palabras prohibidas.
//
// Uso:
//   const { isBlocked, censor } = require("./wordfilter");
//   if (isBlocked(mensaje)) { /* rechazar el mensaje */ }
//   const limpio = censor(mensaje); // reemplaza las palabras prohibidas

// Se bloquean SOLO como palabra completa (evita falsos positivos
// como "night", "knight", "signal", "Dunigan", etc.)
const BLOCKED_WORDS = [
  "nig",
  "niga",
  "niger",
  "seamus",
  "seamas",
];

// Se bloquean aunque estén pegadas a otras letras o separadas
// con espacios/símbolos (n.i.g.g.e.r, n i g g a, etc.)
const BLOCKED_SUBSTRINGS = [
  "nigger",
  "niggar",
  "nigga",
  "seamass",
  "seamus",
];

// Sustituciones comunes para evadir filtros (leetspeak)
const LEET = {
  "@": "a", "4": "a",
  "3": "e",
  "1": "i", "!": "i", "|": "i",
  "0": "o",
  "$": "s", "5": "s",
  "7": "t",
};

// Minúsculas, sin acentos, con leetspeak convertido
function normalize(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[@4310!|$57]/g, (c) => LEET[c]);
}

// Colapsa letras repetidas: "niiigggaaa" -> "niga"
function collapseRepeats(text) {
  return text.replace(/(.)\1+/g, "$1");
}

// Palabras completas ya normalizadas y colapsadas
const BLOCKED_WORDS_SET = new Set(BLOCKED_WORDS.map(collapseRepeats));

function isBlocked(text) {
  const clean = normalize(text);

  // 1) Coincidencia por palabra completa (con repeticiones colapsadas)
  const tokens = clean.split(/[^a-z]+/).filter(Boolean);
  for (const token of tokens) {
    if (BLOCKED_WORDS_SET.has(collapseRepeats(token))) return true;
  }

  // 2) Coincidencia por subcadena, ignorando espacios y símbolos
  const squashed = clean.replace(/[^a-z]/g, "");
  for (const bad of BLOCKED_SUBSTRINGS) {
    if (squashed.includes(bad)) return true;
  }

  return false;
}

// Palabras con las que se reemplaza lo prohibido (puedes editar esta lista)
const REPLACEMENTS = [
  "racist",
  "seamass",
  "banana",
  "potato",
  "cookie",
  "unicorn",
  "pickle",
  "waffle",
];

function randomReplacement() {
  return REPLACEMENTS[Math.floor(Math.random() * REPLACEMENTS.length)];
}

// Reemplaza cada palabra prohibida por una palabra de REPLACEMENTS.
// Las palabras normales del mensaje no se tocan.
function censor(text) {
  const original = String(text);
  let changed = false;

  const result = original.replace(/\S+/g, (token) => {
    if (isBlocked(token)) {
      changed = true;
      return randomReplacement();
    }
    return token;
  });

  if (changed) return result;

  // Caso especial: letras separadas ("n i g g e r"), que solo se detectan
  // mirando el mensaje completo. Se reemplaza todo el mensaje.
  if (isBlocked(original)) return randomReplacement();

  return original;
}

module.exports = { isBlocked, censor, BLOCKED_WORDS, BLOCKED_SUBSTRINGS, REPLACEMENTS };
