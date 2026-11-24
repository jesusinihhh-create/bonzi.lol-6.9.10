// wordfilter.js
// Filtro de palabras prohibidas.
//
// Uso:
//   const { isBlocked } = require("./wordfilter");
//   if (isBlocked(mensaje)) { /* rechazar el mensaje */ }

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

module.exports = { isBlocked, BLOCKED_WORDS, BLOCKED_SUBSTRINGS };
