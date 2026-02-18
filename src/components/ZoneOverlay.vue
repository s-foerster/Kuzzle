<template>
  <div class="zone-overlay">
    <svg
      :viewBox="`0 0 ${gridSize * cellSize} ${gridSize * cellSize}`"
      width="100%"
      height="100%"
      class="zone-svg"
    >
      <path
        v-for="(path, index) in zonePaths"
        :key="index"
        :d="path.d"
        fill="none"
        stroke="#111"
        stroke-width="8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  zones: {
    type: Array,
    required: true,
  },
  gridSize: {
    type: Number,
    required: true,
  },
});

const cellSize = 100; // Unité arbitraire pour le SVG, on scale avec CSS

const zonePaths = computed(() => {
  if (!props.zones || props.zones.length === 0) return [];

  // Couleurs de stroke par zone (optionnel, pour debug ou style avancé)
  // Ici on retourne juste un tableau d'objets avec d et id.

  const paths = [];

  // Grouper les cellules par zone
  const zoneMap = {};
  for (let r = 0; r < props.gridSize; r++) {
    for (let c = 0; c < props.gridSize; c++) {
      const zoneId = props.zones[r]?.[c];
      if (zoneId === undefined) continue;

      if (!zoneMap[zoneId]) zoneMap[zoneId] = [];
      zoneMap[zoneId].push({ r, c });
    }
  }

  // Générer le path pour chaque zone
  for (const [zoneId, cells] of Object.entries(zoneMap)) {
    const d = generateZonePath(cells);
    paths.push({ id: zoneId, d });
  }

  return paths;
});

function generateZonePath(cells) {
  // Génère un path SVG pour les bordures externes d'un ensemble de cellules
  let pathCommands = "";
  const S = cellSize;

  // Créer une map pour accès rapide
  const cellSet = new Set(cells.map((c) => `${c.r},${c.c}`));
  const hasNeighbor = (r, c) => cellSet.has(`${r},${c}`);

  // Parcourir chaque cellule
  cells.forEach(({ r, c }) => {
    const x = c * S;
    const y = r * S;

    // Pour chaque côté sans voisin de même zone, on ajoute une ligne.
    // L'astuce pour avoir des coins "intérieurs" arrondis est de s'assurer
    // que le stroke-linecap="round" dessine un cercle à chaque sommet.
    // Les segments sont dessinés individuellement :
    // M x1,y1 L x2,y2

    // Haut
    if (!hasNeighbor(r - 1, c)) {
      pathCommands += `M${x},${y} L${x + S},${y} `;
    }
    // Bas
    if (!hasNeighbor(r + 1, c)) {
      pathCommands += `M${x},${y + S} L${x + S},${y + S} `;
    }
    // Gauche
    if (!hasNeighbor(r, c - 1)) {
      pathCommands += `M${x},${y} L${x},${y + S} `;
    }
    // Droite
    if (!hasNeighbor(r, c + 1)) {
      pathCommands += `M${x + S},${y} L${x + S},${y + S} `;
    }
  });

  return pathCommands;
}
</script>

<style scoped>
.zone-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 20; /* Au-dessus des cellules */
}

/* On peut ajouter un filtre drop-shadow pour du relief si voulu */
.zone-svg {
  display: block;
  /* Rend les lignes plus nettes sur certains écrans */
  shape-rendering: geometricPrecision;
}
</style>
