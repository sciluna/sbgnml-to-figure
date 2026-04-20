/**
 * themes.js
 * Contains the color palettes and styling configurations for the SBGN renderer.
 * Users can override these properties using the `customTheme` option.
 */

export const coolTheme = {
  name: "cool",

  // --- Nodes (Glyphs) ---
  macromolecule: {
    fill: "url(#gradMacromolecule)", // Uses the gradient defined below
    stroke: "#5b9bd5", // Soft Blue
    text: "#2c3e50"    // Dark Navy
  },
  simpleChemical: {
    fill: "url(#gradChemical)", // Uses the gradient defined below
    stroke: "#8bc34a", // Soft Green
    text: "#33691e"    // Dark Green
  },
  complex: {
    fill: "#f9f9f9",   // Off-white
    stroke: "#7f8c8d", // Neutral Grey
    text: "#555555"    // Dark Grey
  },
  nucleicAcidFeature: {
    fill: "#fdf2e9",   // Soft Orange/Peach
    stroke: "#e67e22", // Vibrant Orange
    text: "#d35400"    // Dark Orange
  },
  phenotype: {
    fill: "#f4f6f7",   // Light Grey/Blue
    stroke: "#7f8c8d", // Neutral Grey
    text: "#2c3e50"    // Dark Navy
  },
  unspecifiedEntity: {
    fill: "#f0f3f4",   // Light Grey
    stroke: "#95a5a6", // Muted Grey
    text: "#34495e"    // Dark Grey
  },
  perturbingAgent: {
    fill: "#f9ebea",   // Soft Red/Pink
    stroke: "#c0392b", // Strong Red
    text: "#922b21"    // Dark Red
  },
  compartment: {
    fill: "#f7f9fa",   // Very light grey-blue (Opaque)
    stroke: "#aeb6bf", // Thick Grey
    text: "#5d6d7e"    // Slate Grey
  },
  process: {
    fill: "#ffffff",   // White
    stroke: "#555555", // Dark Grey
    text: "#333333"    // Almost Black
  },
  association: {
    fill: "#555555",   // White
    stroke: "#555555", // Dark Grey
    text: "#333333"    // Almost Black
  },
  dissociation: {
    fill: "#ffffff",   // White
    stroke: "#555555", // Dark Grey
    text: "#333333"    // Almost Black
  },
  logicalOperator: {
    fill: "#ffffff",   // White
    stroke: "#555555", // Dark Grey
    text: "#333333"    // Almost Black
  },
  tag: {
    fill: "#ffffff",   // White
    stroke: "#555555", // Dark Grey
    text: "#333333"    // Almost Black
  },
  emptySet: {
    fill: "#ffffff",   // White
    stroke: "#7f8c8d", // Neutral Grey
    text: "#7f8c8d"    // Neutral Grey
  },
  biologicalActivity: {
    fill: "url(#gradMacromolecule)",
    stroke: "#5b9bd5",
    text: "#2c3e50"
  },

  // --- Auxiliary Units (Stickers) ---
  stateVariable: {
    fill: "#ffffff",   // White
    stroke: "#2c3e50", // Dark Navy
    text: "#333333"    // Almost Black
  },
  unitOfInformation: {
    fill: "#f5f5f5",   // Very Light Grey
    stroke: "#7f8c8d", // Neutral Grey
    text: "#555555"    // Dark Grey
  },

  // --- Structural Markers ---
  cloneMarker: {
    fill: "#a0a0a0"    // Medium Grey
  },
  multimerMarker: {
    // Note: Multimer stroke usually inherits from the parent node's stroke,
    // but we can define a fallback here.
    fallbackStroke: "#999999" 
  },

  // --- Edges (Arcs) ---
  edge: {
    defaultStroke: "#555555", // Dark Grey for production, catalysis, etc.
    inhibitionStroke: "#555555", // Red for inhibition
    equivalenceStroke: "#555555", // Lighter grey for equivalence arcs
    text: "#555555" // If edges ever get labels
  },

  // --- SVG Definitions (Gradients & Filters) ---
  // These are injected directly into the <defs> block.
  // Users can override these strings to provide their own gradients or solid colors.
  gradients: `
    <linearGradient id="gradMacromolecule" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#f8fbff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#d1e6ff;stop-opacity:1" />
    </linearGradient>
    
    <linearGradient id="gradChemical" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#fafff8;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e2ffd1;stop-opacity:1" />
    </linearGradient>
  `,

  filters: `
    <filter id="dropShadow" x="-20%" y="-20%" width="150%" height="150%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" />
      <feOffset dx="1.5" dy="1.5" result="offsetblur" />
      <feComponentTransfer><feFuncA type="linear" slope="0.3"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  `
};

export const bluescaleTheme = {
  name: "bluescale",

  // Düğümleri dolgu renkleri ve kenarlık stilleriyle ayıralım
  macromolecule: {
    fill: "#9ecae1",
    stroke: "#3182bd", 
    text: "#08306b"
  },
  simpleChemical: {
    fill: "#c6dbef", // Slightly lighter blue to differentiate from proteins
    stroke: "#6baed6",
    text: "#08519c"
  },
  complex: {
    fill: "#eff3ff", // Very pale blue/white for containers
    stroke: "#3182bd",
    text: "#08306b"
  },
  nucleicAcidFeature: {
    fill: "#6baed6", // Slightly darker than the base for DNA/RNA
    stroke: "#2171b5",
    text: "#ffffff"  // White text for contrast on darker blue
  },
  phenotype: {
    fill: "#9ecae1",
    stroke: "#08519c", // Darkest border to make the hexagon pop
    text: "#08306b"
  },
  unspecifiedEntity: {
    fill: "#deebf7", // Pale blue
    stroke: "#6baed6",
    text: "#08519c"
  },
  perturbingAgent: {
    fill: "#4292c6", // Deeper blue for agents/drugs
    stroke: "#084594",
    text: "#ffffff"
  },
  compartment: {
    fill: "none",      // Keep empty so it doesn't overwhelm the blue nodes
    stroke: "#9ecae1", // Soft blue border
    text: "#3182bd"    // Matching text
  },
  process: {
    fill: "#ffffff",   // White
    stroke: "#555555", // Dark Grey
    text: "#000000"    // Almost Black
  },
  association: {
    fill: "#555555",
    stroke: "#555555",
    text: "#333333"
  },
  dissociation: {
    fill: "#ffffff",   // White
    stroke: "#555555", // Dark Grey
    text: "#333333"    // Almost Black
  },
  logicalOperator: {
    fill: "#ffffff",   // White
    stroke: "#555555", // Dark Grey
    text: "#333333"    // Almost Black
  },
  tag: {
    fill: "#ffffff",   // White
    stroke: "#555555", // Dark Grey
    text: "#333333"    // Almost Black
  },
  emptySet: {
    fill: "#ffffff",   // White
    stroke: "#7f8c8d", // Neutral Grey
    text: "#7f8c8d"    // Neutral Grey
  },
  biologicalActivity: {
    fill: "#9ecae1",
    stroke: "#3182bd", 
    text: "#08306b"
  },

  stateVariable: { fill: "#ffffff", stroke: "#000000", text: "#000000" },
  unitOfInformation: { fill: "#f0f0f0", stroke: "#333333", text: "#000000" },
  cloneMarker: { fill: "#777777" },
  edge: {
    defaultStroke: "#555555",
    inhibitionStroke: "#555555",
    equivalenceStroke: "#555555"
  },
  // Bu temada gradyan kullanmıyoruz
  gradients: ``,
  // Gölge efekti siyah-beyazda da güzel durur, koruyabiliriz
  filters: coolTheme.filters
};

export const warmTheme = {
  name: "warm",

  // Sıcak, sonbahar renk paleti. Gradyanlar korunuyor ama renkleri farklı.
  macromolecule: {
    fill: "url(#gradMacromoleculeWarm)",
    stroke: "#a569bd",
    text: "#4a235a"
  },
  simpleChemical: {
    fill: "url(#gradChemicalWarm)",
    stroke: "#f5b041", // Yumuşak Altın Sarısı
    text: "#7e5109"    // Koyu Hardal
  },
  complex: {
    fill: "#fdfefe",
    stroke: "#b0a8a0", // Sıcak Gri
    text: "#4d4135"    // Koyu Kahve
  },
  nucleicAcidFeature: {
    fill: "#f5cba7", // Uçuk Şeftali
    stroke: "#e67e22", // Yanık Turuncu
    text: "#6e2c00"
  },
  phenotype: {
    fill: "#d2b4de", // Uçuk Leylak
    stroke: "#8e44ad", // Koyu Leylak
    text: "#3c134e"
  },
  unspecifiedEntity: {
    fill: "#f2f3f4",
    stroke: "#99a3a4",
    text: "#273746"
  },
  perturbingAgent: {
    fill: "#fadbd8", // Uçuk Somon
    stroke: "#c0392b", // Koyu Somon
    text: "#641e16"
  },
  compartment: {
    fill: "#fcfaf8", // Çok uçuk, sıcak bir beyaz
    stroke: "#d5d0ca",
    text: "#5c5145"
  },
  biologicalActivity: {
    fill: "url(#gradMacromoleculeWarm)",
    stroke: "#a569bd",
    text: "#4a235a"
  },
  process: {
    fill: "#ffffff",   // White
    stroke: "#555555", // Dark Grey
    text: "#333333"    // Almost Black
  },
  association: {
    fill: "#555555",   // White
    stroke: "#555555", // Dark Grey
    text: "#333333"    // Almost Black
  },
  dissociation: {
    fill: "#ffffff",   // White
    stroke: "#555555", // Dark Grey
    text: "#333333"    // Almost Black
  },
  logicalOperator: {
    fill: "#ffffff",   // White
    stroke: "#555555", // Dark Grey
    text: "#333333"    // Almost Black
  },
  stateVariable: { fill: "#ffffff", stroke: "#a569bd", text: "#4a235a" },
  unitOfInformation: { fill: "#f8f9f9", stroke: "#b0a8a0", text: "#4d4135" },
  
  cloneMarker: { fill: "#c1b8b0" }, // Sıcak gri
  multimerMarker: { fallbackStroke: "#b0a8a0" },

  edge: {
    defaultStroke: "#706356", // Koyu Kahve/Gri
    inhibitionStroke: "#706356",
    equivalenceStroke: "#b0a8a0"
  },

  // --- BU TEMAYA ÖZEL YENİ GRADYANLAR ---
  gradients: `
    <linearGradient id="gradMacromoleculeWarm" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#f5eef8;" />
      <stop offset="100%" style="stop-color:#e8daef;" />
    </linearGradient>
    <linearGradient id="gradChemicalWarm" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#fef9e7;" />
      <stop offset="100%" style="stop-color:#fdebd0;" />
    </linearGradient>
  `,
  
  filters: coolTheme.filters // Gölgeleri koruyoruz
};

export const colorblindTheme = {
  name: "colorblind",

  // Okabe-Ito renk paletinden ilham alınmıştır. 
  // Kırmızı ve yeşil tonları yerine mavi, sarı, turuncu ve mor tonları kullanılır.
  macromolecule: {
    fill: "url(#gradMacromoleculeCB)",
    stroke: "#0072B2",
    text: "#003e63"
  },
  simpleChemical: {
    fill: "url(#gradChemicalCB)",
    stroke: "#F0E442",
    text: "#807800"
  },
  complex: {
    fill: "#ffffff",
    stroke: "#555555",
    text: "#555555"
  },
  nucleicAcidFeature: {
    fill: "#ffe1cc",
    stroke: "#D55E00",
    text: "#6b2f00"
  },
  phenotype: {
    fill: "#f2e6ff",
    stroke: "#CC79A7",
    text: "#663651"
  },
  unspecifiedEntity: {
    fill: "#e6f7ff",
    stroke: "#009E73",
    text: "#004d38"
  },
  perturbingAgent: {
    fill: "#e6e6e6",
    stroke: "#555555",
    text: "#555555"
  },
  compartment: {
    fill: "#fcfcfc",
    stroke: "#999999",
    text: "#333333"
  },
  biologicalActivity: {
    fill: "url(#gradMacromoleculeCB)",
    stroke: "#0072B2",
    text: "#003e63"
  },
  process: {
    fill: "#ffffff",   // White
    stroke: "#555555", // Dark Grey
    text: "#333333"    // Almost Black
  },
  association: {
    fill: "#555555",   // White
    stroke: "#555555", // Dark Grey
    text: "#333333"    // Almost Black
  },
  dissociation: {
    fill: "#ffffff",   // White
    stroke: "#555555", // Dark Grey
    text: "#333333"    // Almost Black
  },
  logicalOperator: {
    fill: "#ffffff",   // White
    stroke: "#555555", // Dark Grey
    text: "#333333"    // Almost Black
  },
  stateVariable: { fill: "#ffffff", stroke: "#000000", text: "#000000" },
  unitOfInformation: { fill: "#f0f0f0", stroke: "#000000", text: "#000000" },
  
  cloneMarker: { fill: "#b3b3b3" },
  multimerMarker: { fallbackStroke: "#666666" },

  edge: {
    defaultStroke: "#555555", // Net siyah
    // Kırmızı yerine Magenta/Pembe (Renk körleri tarafından siyah/griden kolayca ayrılır)
    inhibitionStroke: "#555555", 
    equivalenceStroke: "#555555"
  },

  // --- BU TEMAYA ÖZEL YENİ GRADYANLAR ---
  gradients: `
    <linearGradient id="gradMacromoleculeCB" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#e6f3ff;" />
      <stop offset="100%" style="stop-color:#b3dfff;" />
    </linearGradient>
    <linearGradient id="gradChemicalCB" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#fffce6;" />
      <stop offset="100%" style="stop-color:#fff9b3;" />
    </linearGradient>
  `,
  
  filters: coolTheme.filters
};

export const blankTheme = {
  name: "blank",

  // Tüm dolgular beyaz. Kenarlıklar ve metinler tutarlı bir koyu gri.
  macromolecule: { fill: "#ffffff", stroke: "#555555", text: "#000000" },
  simpleChemical: { fill: "#ffffff", stroke: "#555555", text: "#000000" },
  complex: { fill: "#ffffff", stroke: "#555555", text: "#000000" },
  nucleicAcidFeature: { fill: "#ffffff", stroke: "#555555", text: "#000000" },
  phenotype: { fill: "#ffffff", stroke: "#555555", text: "#000000" },
  unspecifiedEntity: { fill: "#ffffff", stroke: "#555555", text: "#000000" },
  perturbingAgent: { fill: "#ffffff", stroke: "#555555", text: "#000000" },
  
  compartment: {
    fill: "none", // Konteynerin içi tamamen boş olmalı
    stroke: "#cccccc", // Çok açık gri, dikkat dağıtmayan kenarlık
    text: "#555555"
  },
  biologicalActivity: { fill: "#ffffff", stroke: "#555555", text: "#000000" },
  process: { fill: "#ffffff", stroke: "#555555", text: "#000000" },
  logicalOperator: { fill: "#ffffff", stroke: "#555555", text: "#000000" },
  tag: { fill: "#ffffff", stroke: "#555555", text: "#000000" },
  emptySet: { fill: "#ffffff", stroke: "#999999", text: "#999999" },

  stateVariable: { fill: "#ffffff", stroke: "#000000", text: "#000000" },
  unitOfInformation: { fill: "#f0f0f0", stroke: "#555555", text: "#000000" },
  
  cloneMarker: { fill: "#bbbbbb" },
  multimerMarker: { fallbackStroke: "#888888" },

  edge: {
    defaultStroke: "#555555", // Tüm standart oklar koyu gri
    inhibitionStroke: "#555555", // Engelleme de aynı renk, şekliyle ayırt edilecek
    equivalenceStroke: "#aaaaaa"
  },

  // Bu temada ne gradyan ne de gölge var. Tamamen "flat" ve temiz.
  gradients: ``,
  filters: `` 
};

// Export an object containing all available themes.
export const themes = {
  cool: coolTheme,
  bluescale: bluescaleTheme,
  warm: warmTheme,
  colorblind: colorblindTheme,
  blank: blankTheme
  // Gelecekte buraya yeni temalar ekleyebilirsiniz: 'dark', 'colorblindFriendly' vb.
};
