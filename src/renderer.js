import { themes } from './themes.js';

/**
 * Main entry point for rendering the parsed SBGN graph to a paper-ready SVG string.
 * @param {Object} graph - The parsed graph object containing { nodes, edges }.
 * @returns {string} - The complete SVG string.
 */
export function renderGraphToSVG(graph, options = {}) {
  const { nodes, edges } = graph;

  // Önce, kullanıcı bir tema adı belirtti mi diye bakalım (örneğin 'greyscale').
  // Belirtmediyse 'default' temasını baz alalım.
  const themeName = options.theme || 'cool';
  const selectedTheme = themes[themeName] || themes['cool'];
  
  // Kullanıcının özel renk tanımlamalarını (customTheme) ana tema ile birleştir (Merge)
  // Bu sayede kullanıcı sadece değiştirmek istediği kısımları gönderebilir.
  const currentTheme = {
    ...themes['cool'], // Önce varsayılanı yükle
    ...selectedTheme,     // Sonra seçilen temanın değerleriyle ez
    ...(options.customTheme || {}) // En son kullanıcı özelleştirmeleriyle ez
  };

  // --- 2. Bounding Box hesaplaması (Aynı kalıyor) ---
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  nodes.forEach(node => {
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + node.width);
    maxY = Math.max(maxY, node.y + node.height);
  });
  const padding = 20;
  minX = (minX === Infinity ? 0 : minX) - padding;
  minY = (minY === Infinity ? 0 : minY) - padding;
  const viewWidth = (maxX === -Infinity ? 800 : maxX - minX) + padding * 2;
  const viewHeight = (maxY === -Infinity ? 600 : maxY - minY) + padding * 2;

  // --- 3. <defs> Bloğunu Temadan Al ---
  // Artık defs bloğunu oluştururken 'currentTheme' objesini kullanacağız
  const defs = getSharedDefinitions(currentTheme);

  // --- 4. DOĞRU RENDER SIRASI (Konteynerler, Oklar, Foregrounds) ---
  const containerNodes = nodes.filter(n => ['compartment', 'complex'].includes(n.type));
  const foregroundNodes = nodes.filter(n => !['compartment', 'complex'].includes(n.type));

  // DİKKAT: Artık tüm renderNode ve renderEdge fonksiyonlarına 'currentTheme' parametresini gönderiyoruz!
  const renderedContainers = containerNodes.map(node => renderNode(node, nodes, currentTheme, options)).join("\n");
  
  const renderedEdges = edges.map(edge => {
    const resolveNode = (id) => {
        let foundNode = nodes.find(n => n.id === id);
        if (!foundNode && id.includes('.')) {
            const parentId = id.split('.').slice(0, -1).join('.');
            foundNode = nodes.find(n => n.id === parentId);
        }
        return foundNode;
    };
    const sourceNode = resolveNode(edge.source);
    const targetNode = resolveNode(edge.target);
    if (sourceNode && targetNode) {
        return renderEdge(edge, sourceNode, targetNode, currentTheme);
    }
    return "";
  }).join("\n");
  
  const renderedForegrounds = foregroundNodes.map(node => renderNode(node, nodes, currentTheme, options)).join("\n");

  // --- 5. Nihai SVG'yi Birleştir ---
  return `
    <svg xmlns="http://www.w3.org/2000/svg" 
         width="100%" height="100%" 
         viewBox="${minX} ${minY} ${viewWidth} ${viewHeight}">
      
      ${defs}
      
      <g id="containers-layer">
        ${renderedContainers}
      </g>
      
      <g id="edges-layer">
        ${renderedEdges}
      </g>
      
      <g id="foreground-nodes-layer">
        ${renderedForegrounds}
      </g>
    </svg>
  `;
}

function getNodeRenderFunction(node) {
  const type = node.type || '';

  // Process Description (PD) & Activity Flow (AF) Entities
  if (type.includes('macromolecule')) return renderMacromolecule;
  if (type.includes('simple chemical') || type.includes('metabolite')) return renderSimpleChemical;
  if (type.includes('complex')) return renderComplex;
  if (type.includes('nucleic acid feature')) return renderNucleicAcidFeature;
  if (type.includes('phenotype')) return renderPhenotype;
  if (type.includes('unspecified entity')) return renderUnspecifiedEntity;
  if (type.includes('perturbing agent')) return renderPerturbingAgent;
  if (type.includes('biological activity')) return renderBiologicalActivity;

  // Process Nodes
  if (type.includes('process') || type.includes('omitted process') || type.includes('uncertain process')) return renderProcess;
  if (type.includes('association')) return renderAssociation;
  if (type.includes('dissociation')) return renderDissociation;

  // Containers & Logic
  if (type.includes('compartment')) return renderCompartment;
  if (type.includes('and') || type.includes('or') || type.includes('not') || type.includes('delay')) return renderLogicalOperator;
  if (type.includes('tag') || type.includes('submap terminal')) return renderTag;
  if (type.includes('empty set') || type.includes('source and sink')) return renderEmptySet;

  // If no match is found
  return null;
}

/**
 * Routes the node to its specific rendering function based on its SBGN class type.
 * Ensures all auxiliary units (like state variables) are also rendered.
 * @param {Object} node - The parsed node object containing type, dimensions, and nested units.
 * @returns {string} - The SVG string representation of the node and its components.
 */
function renderNode(node, allNodes, theme, options) {
  // 1. Get the correct rendering function for this specific SBGN class
  const renderFn = getNodeRenderFunction(node);

  if (renderFn) {
    // 2. Call the function with the appropriate arguments.
    // 'renderComplex' is special because it needs 'allNodes' to know if it has children.
    if (renderFn === renderComplex) {
      return renderFn(node, allNodes, theme, options);
    } 
    // All other node functions just need the node and the theme.
    else {
      return renderFn(node, theme, options);
    }
  }
  
  // 3. Fallback: If the SBGN class is completely unknown, draw a generic red rectangle
  console.warn(`Unrecognized SBGN class type: "${node.type}". Falling back to generic node.`);
  return renderGenericNode(node);
}

/**
 * Generates the <defs> section for the SVG including filters and gradients.
 * This provides the "fancy" look across all shapes.
 */
function getSharedDefinitions(theme) {
  // Ok uçlarının (markers) renklerini temadan çekiyoruz
  const edgeStroke = theme.edge.defaultStroke;
  const inhibitionStroke = theme.edge.inhibitionStroke;

  return `
    <defs>
      ${theme.filters || ""}
      ${theme.gradients || ""}
      <marker id="marker-production" markerWidth="10" markerHeight="10" refX="8.66" refY="5" orient="auto">
        <path d="M 0 0 L 8.66 5 L 0 10 Z" fill="${edgeStroke}" />
      </marker>
      <marker id="marker-stimulation" markerWidth="11" markerHeight="10" refX="9.66" refY="5" orient="auto">
        <path d="M 1 0 L 9.66 5 L 1 10 Z" fill="#ffffff" stroke="${edgeStroke}" stroke-width="1.5" />
      </marker>
      <marker id="marker-necessary-stimulation" markerWidth="15" markerHeight="10" refX="12.66" refY="5" orient="auto">
        <line x1="2" y1="0" x2="2" y2="10" stroke="${edgeStroke}" stroke-width="1.5" />
        <path d="M 4 0 L 12.66 5 L 4 10 Z" fill="#ffffff" stroke="${edgeStroke}" stroke-width="1.5" />
      </marker>
      <marker id="marker-catalysis" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
        <circle cx="6" cy="6" r="4" fill="#ffffff" stroke="${edgeStroke}" stroke-width="1.5" />
      </marker>
      <marker id="marker-modulation" markerWidth="12" markerHeight="12" refX="12" refY="6" orient="auto">
        <polygon points="6,0 12,6 6,12 0,6" fill="#ffffff" stroke="${edgeStroke}" stroke-width="1.5" />
      </marker>
      <marker id="marker-inhibition" markerWidth="8" markerHeight="12" refX="2" refY="6" orient="auto">
        <line x1="2" y1="1" x2="2" y2="11" stroke="${inhibitionStroke}" stroke-width="4" />
      </marker>
    </defs>
  `;
}

function renderMacromolecule(node, theme, options = {}) {
  const { width, height, label, id, x, y } = node;
  const colors = theme.macromolecule;

  // --- ORANTISAL KÖŞE YARIÇAPI ---
  // Yarıçap, yüksekliğin %25'i olsun.
  // Bu, şekil ne kadar küçük olursa olsun, "stadyum"a dönüşmesini engeller.
  // En az 4px, en fazla 12px gibi sınırlar da koyabiliriz.
  const cornerRadius = Math.max(4, Math.min(height * 0.25, 12));

  const isIcon = options.isIcon || false;
  const textElement = !isIcon ? renderFitText(label, width, height, 12, colors.text, 'normal') : "";
  
  node.strokeColor = colors.stroke;
  const multimerMarker = renderMultimerMarker(node);
  const cloneMarker = renderCloneMarker(node);

  return `
    <g class="node-group macromolecule" id="${id}" transform="translate(${x}, ${y})">
      ${multimerMarker}
      <rect width="${width}" height="${height}" rx="${cornerRadius}" ry="${cornerRadius}"
            fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2" filter="url(#dropShadow)" />
      ${cloneMarker}
      ${textElement}
      ${!isIcon ? renderAuxiliaryUnits(node, theme, options) : ''}
    </g>
  `;
}

function renderSimpleChemical(node, theme, options = { isIcon: false }) {
  const { width, height, label, id, x, y } = node;
  const cornerRadius = height / 2;
  const colors = theme.simpleChemical;

  const textElement = !options.isIcon ? renderFitText(label, width, height, 11, colors.text, 'normal') : "";
  node.strokeColor = colors.stroke;

  const multimerMarker = renderMultimerMarker(node);
  const cloneMarker = renderCloneMarker(node);

  return `
    <g class="node-group simple-chemical" id="${id}" transform="translate(${x}, ${y})">
      ${multimerMarker}
      <rect width="${width}" height="${height}" rx="${cornerRadius}" ry="${cornerRadius}"
            fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2" filter="url(#dropShadow)" />
      ${cloneMarker}
      ${textElement}
      ${!options.isIcon ? renderAuxiliaryUnits(node, theme, options) : ''}
    </g>
  `;
}

/**
 * Renders a Complex (Container) node.
 */
function renderComplex(node, allNodes, theme, options = { isIcon: false }) { // 'allNodes' artık opsiyonel
  const { width: w, height: h, label, id, x, y } = node;
  const colors = theme.complex;

  // --- GÜVENLİK ve AKILLI ETİKETLEME ---
  let hasChildren = false;
  // Sadece 'allNodes' dizisi varsa çocuk kontrolü yap.
  // Eğer yoksa (yani bu bir UI ikonuysa), 'hasChildren' false kalır.
  if (allNodes && Array.isArray(allNodes)) {
    hasChildren = allNodes.some(n => n.parentId === id);
  }

  let labelElement = "";
  if (label) {
    if (hasChildren) {
      // ÇOCUKLARI VAR: Etiketi alta yaz.
      labelElement = `<text x="${w / 2}" y="${h + 10}" text-anchor="middle" dominant-baseline="middle" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="bold" fill="${colors.text}">${label}</text>`;
    } else {
      // ÇOCUĞU YOK (veya bu bir ikon): Etiketi merkeze yaz.
      labelElement = !options.isIcon ? renderFitText(label, w, h, 11, colors.text, 'bold') : "";
    }
  }

  // --- DİĞER GÖRSEL ELEMENTLER (Aynı kalıyor) ---
  const cut = Math.min(w, h) * 0.15;
  const pathData = `M ${cut},0 L ${w-cut},0 L ${w},${cut} L ${w},${h-cut} L ${w-cut},${h} L ${cut},${h} L 0,${h-cut} L 0,${cut} Z`;
  node.strokeColor = colors.stroke;
  const multimerMarker = renderMultimerMarker(node);
  const cloneMarker = renderCloneMarker(node);

  // --- NİHAİ SVG'Yİ OLUŞTUR ---
  return `
    <g class="node-group complex" id="${id}" transform="translate(${x}, ${y})">
      <g class="complex-background">
        ${multimerMarker}
        <path d="${pathData}" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2" filter="url(#dropShadow)" />
        ${cloneMarker}
      </g>
      ${labelElement}
      ${!options.isIcon ? renderAuxiliaryUnits(node, theme, options) : ''}
    </g>
  `;
}

/**
 * Renders a Nucleic Acid Feature node.
 * SBGN Standard: A rectangle with the bottom corners rounded.
 */
function renderNucleicAcidFeature(node, theme, options = { isIcon: false }) {
  const { width: w, height: h, label, id, x, y } = node;
  const rx = Math.min(w, h) * 0.2; 
  const colors = theme.nucleicAcidFeature;
  
  const pathData = `M 0 0 L ${w} 0 L ${w} ${h - rx} Q ${w} ${h} ${w - rx} ${h} L ${rx} ${h} Q 0 ${h} 0 ${h - rx} Z`;

  const textElement = !options.isIcon ? renderFitText(label, w, h, 12, colors.text, 'normal') : "";

  node.strokeColor = colors.stroke;
  const multimerMarker = renderMultimerMarker(node);
  const cloneMarker = renderCloneMarker(node);

  return `
    <g class="node-group nucleic-acid" id="${id}" transform="translate(${x}, ${y})">
      ${multimerMarker}
      <path d="${pathData}" fill="${colors.fill}" stroke="${node.strokeColor}" stroke-width="2" filter="url(#dropShadow)" />
      ${cloneMarker}
      ${textElement}
      ${!options.isIcon ? renderAuxiliaryUnits(node, theme, options) : ''}
    </g>
  `;
}

/**
 * Renders a Phenotype node.
 * SBGN Standard: A regular Hexagon.
 */
function renderPhenotype(node, theme, options = { isIcon: false }) {
  const { width: w, height: h, label, id, x, y } = node;
  const dx = w * 0.15; 
  const points = `0,${h/2} ${dx},0 ${w-dx},0 ${w},${h/2} ${w-dx},${h} ${dx},${h}`;
  const colors = theme.phenotype;

  // Fenotip için nötr, koyu lacivert/gri metin
  const textElement = !options.isIcon ? renderFitText(label, w, h, 12, colors.text, 'normal') : "";

  return `
    <g class="node-group phenotype" id="${id}" transform="translate(${x}, ${y})">
      <polygon points="${points}" fill="${colors.fill}" stroke="${colors.stroke}"  stroke-width="2" filter="url(#dropShadow)" />
      ${textElement}
      ${!options.isIcon ? renderAuxiliaryUnits(node, theme, options) : ''}
    </g>
  `;
}

/**
 * Renders an Unspecified Entity node.
 * SBGN Standard: An Ellipse (similar to Simple Chemical, but conceptually different).
 * We use a distinct grey-ish styling to separate it from green metabolites.
 */
function renderUnspecifiedEntity(node, theme, options = { isIcon: false }) {
  const { width, height, label, id, x, y } = node;
  const cx = width / 2;
  const cy = height / 2;
  const colors = theme.unspecifiedEntity;
  const textElement = !options.isIcon ? renderFitText(label, width, height, 12, colors.text, 'normal') : "";
  node.strokeColor = colors.stroke;
  // Unspecified entity multimer olmaz, sadece clone marker alır
  const cloneMarker = renderCloneMarker(node);

  return `
    <g class="node-group unspecified-entity" id="${id}" transform="translate(${x}, ${y})">
      <ellipse cx="${cx}" cy="${cy}" rx="${cx}" ry="${cy}" 
               fill="${colors.fill}" stroke="${node.strokeColor}" stroke-width="2" filter="url(#dropShadow)" />
      ${cloneMarker}
      ${textElement}
      ${!options.isIcon ? renderAuxiliaryUnits(node, theme, options) : ''}
    </g>
  `;
}

/**
 * Renders a Perturbing Agent node.
 * SBGN Standard: A modified hexagon with two opposite concave faces (like a banner).
 */
function renderPerturbingAgent(node, theme, options = { isIcon: false }) {
  const { width: w, height: h, label, id, x, y } = node;
  const dx = w * 0.15; 
  const points = `0,0 ${w},0 ${w-dx},${h/2} ${w},${h} 0,${h} ${dx},${h/2}`;
  const colors = theme.perturbingAgent;

  const textElement = !options.isIcon ? renderFitText(label, w, h, 12, colors.text, 'normal') : "";
  node.strokeColor = colors.stroke;
  // Perturbing agent multimer olmaz, clone marker alır
  const cloneMarker = renderCloneMarker(node);

  return `
    <g class="node-group perturbing-agent" id="${id}" transform="translate(${x}, ${y})">
      <polygon points="${points}" fill="${colors.fill}" stroke="${node.strokeColor}" stroke-width="2" filter="url(#dropShadow)" />
      ${cloneMarker}
      ${textElement}
      ${!options.isIcon ? renderAuxiliaryUnits(node, theme, options) : ''}
    </g>
  `;
}

/**
 * Renders an Empty Set (Source/Sink) node.
 * SBGN Standard: A circle crossed by a diagonal line.
 * It usually doesn't have a label or auxiliary units, but we include them just in case.
 */
function renderEmptySet(node, theme) {
  const cx = node.width / 2;
  const cy = node.height / 2;
  const r = Math.min(cx, cy);
  const colors = theme.emptySet;
  
  // Calculate the coordinates for the diagonal line (top-right to bottom-left)
  // using basic trigonometry (offset = r * sin(45 degrees))
  const offset = r * 0.7071; 

  return `
    <g class="node-group" id="${node.id}" transform="translate(${node.x}, ${node.y})">
      <!-- Main Circle -->
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${colors.fill}" stroke="${colors.stroke}"  stroke-width="2" />
      <!-- Diagonal Line -->
      <line x1="${cx + offset}" y1="${cy - offset}" x2="${cx - offset}" y2="${cy + offset}" 
            stroke="${colors.stroke}"  stroke-width="2" />
      
      <!-- Normally empty sets have no label, but if one exists, render it below -->
      ${node.label ? `
        <text x="${cx}" y="${cy + r + 12}" text-anchor="middle" dominant-baseline="middle" 
              font-family="Arial, Helvetica" font-size="10" fill="${colors.fill}">
          ${node.label}
        </text>
      ` : ""}
      ${renderAuxiliaryUnits(node, theme)}
    </g>
  `;
}

/**
 * Renders a Compartment node.
 * SBGN Standard: A container with heavy borders, containing other nodes.
 * The label is typically positioned at the top or top-left.
 */
function renderCompartment(node, theme, options = { isIcon: false }) {
  const w = node.width;
  const h = node.height;
  const rx = 20;
  const colors = theme.compartment;

  // --- RENK GÜNCELLEMESİ ---
  // Yarı saydamlık yerine, opak ama çok açık bir dolgu rengi kullanalım.
  // Bu, üzerine çizilen okların rengini BOZMAZ.
  const fillColor = colors.fill; // Neredeyse beyaz, çok hafif gri-mavi
  const strokeColor = colors.stroke; 
  const strokeWidth = 4;

  let labelElement = "";
  if (node.label) {
    labelElement = `
      <text x="${w / 2}" y="${h + 12}" 
            text-anchor="middle" dominant-baseline="middle" 
            font-family="Arial, Helvetica, sans-serif" 
            font-size="14" font-weight="bold" fill="${colors.text}" >
        ${node.label}
      </text>
    `;
  }
  
  return `
    <g class="compartment-node" id="${node.id}" transform="translate(${node.x}, ${node.y})">
      <rect width="${w}" height="${h}" rx="${rx}" ry="${rx}" 
            fill="${fillColor}" 
            stroke="${strokeColor}" stroke-width="${strokeWidth}" />
      ${labelElement}
      ${!options.isIcon ? renderAuxiliaryUnits(node, theme, options) : ''}
    </g>
  `;
}

/**
 * Renders a Process node (reaction center).
 * SBGN Standard for Processes:
 * - 'process': A plain square.
 * - 'omitted process': A square containing two parallel diagonal lines (\\\\).
 * - 'uncertain process': A square containing a question mark (?).
 */
function renderProcess(node, theme) {
  const w = node.width;
  const h = node.height;
  const cx = w / 2;
  const cy = h / 2;
  const colors = theme.process;

  let innerContent = "";

  // Styling for the square hub
  const strokeColor = colors.stroke;
  const strokeWidth = "1.5";
  const fillColor = colors.fill;

  // Determine the inner content based on the exact process type
  switch (node.type) {
    case 'omitted process':
      // Two parallel diagonal lines (\\\\) inside the square
      // We calculate offsets to draw them neatly within the bounds
      const offset = w * 0.2; 
      innerContent = `
        <line x1="${offset}" y1="${offset}" x2="${w - offset}" y2="${h - offset}" 
              stroke="${strokeColor}" stroke-width="${strokeWidth}" />
        <line x1="${offset + 4}" y1="${offset}" x2="${w - offset + 4}" y2="${h - offset}" 
              stroke="${strokeColor}" stroke-width="${strokeWidth}" />
      `;
      break;
    
    case 'uncertain process':
      // A question mark (?) inside the square
      innerContent = `
        <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" 
              font-family="Arial, Helvetica, sans-serif" font-size="${h * 0.8}" 
              font-weight="bold" fill="${strokeColor}">?</text>
      `;
      break;

    case 'process':
    default:
      // A plain square (no inner content needed)
      innerContent = "";
      break;
  }

  return `
    <!-- Process Hub: ${node.id} (${node.type}) -->
    <g class="process-node" id="${node.id}" transform="translate(${node.x}, ${node.y})">
      <rect width="${w}" height="${h}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
      ${innerContent}
      
      <!-- Optional label positioning (usually processes don't have prominent labels) -->
      ${node.label ? `
        <text x="${cx}" y="${h + 12}" text-anchor="middle" dominant-baseline="auto" 
              font-family="Arial, Helvetica" font-size="10" fill="${colors.text}">
          ${node.label}
        </text>
      ` : ""}
    </g>
  `;
}

/**
 * Renders an Association node.
 * SBGN Standard: A solid filled circle.
 * Represents the non-covalent binding of entities to form a complex.
 */
function renderAssociation(node, theme) {
  const cx = node.width / 2;
  const cy = node.height / 2;
  const r = Math.min(cx, cy);
  const colors = theme.association;

  return `
    <!-- Association Hub: ${node.id} -->
    <g class="association-node" id="${node.id}" transform="translate(${node.x}, ${node.y})">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="1" />
    </g>
  `;
}

/**
 * Renders a Dissociation node.
 * SBGN Standard: Two concentric circles (one inside the other).
 * Represents the rupture of a non-covalent binding (e.g., a complex breaking apart).
 */
function renderDissociation(node, theme) {
  const cx = node.width / 2;
  const cy = node.height / 2;
  const outerR = Math.min(cx, cy);
  const innerR = outerR * 0.6; // The inner circle is 60% the size of the outer one
  const colors = theme.dissociation;

  return `
    <!-- Dissociation Hub: ${node.id} -->
    <g class="dissociation-node" id="${node.id}" transform="translate(${node.x}, ${node.y})">
      <circle cx="${cx}" cy="${cy}" r="${outerR}" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="1.5" />
      <circle cx="${cx}" cy="${cy}" r="${innerR}" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="1.5" />
    </g>
  `;
}

/**
 * Renders a Logical Operator node (AND, OR, NOT).
 * SBGN Standard: A circle containing the operator's name.
 */
function renderLogicalOperator(node, theme) {
  const { width: w, height: h, id, x, y } = node;
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) / 2;
  const colors = theme.logicalOperator;

  let operatorContent = "";

  if (node.type.includes('delay')) {
    operatorContent = `
      <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central"
            font-family="Georgia, 'Times New Roman', serif" font-size="${r * 1.5}" fill="${colors.text}">τ</text>
    `;
  } else {
    const operatorText = node.type.toUpperCase();
    operatorContent = `
      <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central"
            font-family="Arial, Helvetica, sans-serif" font-size="${r * 0.8}" font-weight="bold" fill="${colors.text}">
        ${operatorText}
      </text>
    `;
  }

  return `
    <g class="logic-operator-node" id="${id}" transform="translate(${x}, ${y})">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="1.5" />
      ${operatorContent}
    </g>
  `;
}

/**
 * Renders a Tag node (Submap Terminal).
 * SBGN Standard: A rectangle with one pointed end (chevron/banner shape).
 */
function renderTag(node) {
  const w = node.width;
  const h = node.height;
  const pointOffset = 15; // How deep the point of the arrow goes

  // SVG Path: Start top-left(0,0) -> top-right(w-offset, 0) -> right-point(w, h/2) -> bottom-right(w-offset, h) -> bottom-left(0, h) -> close
  const pathData = `M 0 0 L ${w - pointOffset} 0 L ${w} ${h / 2} L ${w - pointOffset} ${h} L 0 ${h} Z`;

  return `
    <g class="tag-node" id="${node.id}" transform="translate(${node.x}, ${node.y})">
      <path d="${pathData}" fill="#ffffff" stroke="#555555" stroke-width="1.5" filter="url(#dropShadow)" />
      
      <!-- Center the text slightly to the left to account for the pointed end -->
      <text x="${(w - pointOffset) / 2}" y="${h / 2}" text-anchor="middle" dominant-baseline="middle" 
            font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="bold" fill="#333333">
        ${node.label}
      </text>
    </g>
  `;
}

/**
 * Renders a Biological Activity node (for Activity Flow diagrams).
 * SBGN Standard: A rounded rectangle.
 */
function renderBiologicalActivity(node, theme, options = { isIcon: false }) {
  const { width, height, label, id, x, y } = node;
  const cornerRadius = 0;
  const colors = theme.biologicalActivity || theme.macromolecule; // Tema desteği

  const textElement = !options.isIcon ? renderFitText(label, width, height, 12, colors.text, 'normal') : "";
  node.strokeColor = colors.stroke;
  
  const multimerMarker = renderMultimerMarker(node);
  const cloneMarker = renderCloneMarker(node);

  return `
    <g class="node-group biological-activity" id="${id}" transform="translate(${x}, ${y})">
      ${multimerMarker}
      <rect width="${width}" height="${height}" rx="${cornerRadius}" ry="${cornerRadius}"
            fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2" filter="url(#dropShadow)" />
      ${cloneMarker}
      ${textElement}
      ${!options.isIcon ? renderAuxiliaryUnits(node, theme, options) : ''}
    </g>
  `;
}

function getThemeKeyForFype(typeString) {
  if (!typeString) return 'macromolecule'; // Güvenlik için varsayılan

  // 'biological activity' -> ['biological', 'activity']
  const parts = typeString.split(' ');
  if (parts.length === 1) return parts[0];

  // ['biological', 'activity'] -> 'biological' + 'Activity' -> 'biologicalActivity'
  return parts[0] + parts.slice(1).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

/**
 * Renders auxiliary units (State Variables and Units of Information) for a given node.
 * These are positioned relative to the parent node's top-left corner (x, y).
 * @param {Object} node - The parent node object containing arrays of stateVariables and unitsOfInformation.
 * @returns {string} - The SVG string containing all auxiliary units for this node.
 */
function renderAuxiliaryUnits(node, theme, options = {}) {
  let svgParts = [];

  // Get color palettes from the active theme
  const svColors = theme.stateVariable;
  const uiColors = theme.unitOfInformation;

  // 1. Render State Variables (Rounded Rectangles)
  if (node.stateVariables && node.stateVariables.length > 0) {
    node.stateVariables.forEach(sv => {
      // Calculate relative coordinates relative to the parent node
      const relX = sv.x - node.x;
      const relY = sv.y - node.y;
      
      // Determine the label (prefer variable, fallback to value)
      const label = sv.variable ? sv.variable : (sv.value ? sv.value : "");

      const svSvg = `
        <g class="state-variable" id="${sv.id}" transform="translate(${relX}, ${relY})">
          <rect width="${sv.width}" height="${sv.height}" rx="8" ry="8" 
                fill="${svColors.fill}" stroke="${svColors.stroke}" stroke-width="1.2" />
          <text x="${sv.width / 2}" y="${sv.height / 2}" 
                text-anchor="middle" dominant-baseline="central" 
                font-family="Arial, Helvetica, sans-serif" font-size="10" 
                font-weight="bold" fill="${svColors.text}">
            ${label}
          </text>
        </g>
      `;
      svgParts.push(svSvg);
    });
  }

  // 2. Render Units of Information (Sharp Rectangles OR Mini-Icons)
  if (node.unitsOfInformation && node.unitsOfInformation.length > 0) {
    node.unitsOfInformation.forEach(ui => {
      // Calculate relative coordinates relative to the parent node
      const relX = ui.x - node.x;
      const relY = ui.y - node.y;

      let uiSvg = "";

      // IF AN ENTITY NAME EXISTS, RENDER IT AS A MINI-ICON
      if (ui.entityName) {
        // Create a temporary node object to pass to the render function.
        // We use the UI's bounding box, the entityName as the type, and strip the label.
        const iconNode = { 
            id: `icon_${ui.id}`, 
            type: ui.entityName, 
            x: 0, // x/y are 0 because we translate the group below
            y: 0, 
            width: ui.width, 
            height: ui.height,
            label: "" // Icons shouldn't have text inside them
        };
        
        const iconRenderFunction = getNodeRenderFunction(iconNode);

        if (iconRenderFunction) {
            // CRITICAL: We MUST pass { isIcon: true } as the 3rd or 4th argument 
            // depending on the function signature to prevent infinite loops.

            let themeKey;
            if (options.useParentThemeForIcons) {
                // Ana düğümün tipini camelCase'e çevir
                themeKey = getThemeKeyForFype(node.type);
            } else {
                // İkonun entity adını camelCase'e çevir
                themeKey = getThemeKeyForFype(ui.entityName);
            }
            
            const themeForIcon = theme[themeKey] || theme.macromolecule; // Fallback

            // Geçici bir tema objesi oluşturup sadece ilgili anahtarı değiştiriyoruz
            const finalThemeForIcon = { ...theme, [getThemeKeyForFype(ui.entityName)]: themeForIcon };
            
            let renderedIcon = "";
            if (iconRenderFunction === renderComplex) {
                // renderComplex expects (node, allNodes, theme, options)
                renderedIcon = iconRenderFunction(iconNode, null, finalThemeForIcon, { isIcon: true });
            } else {
                // Standard shape functions expect (node, theme, options)
                renderedIcon = iconRenderFunction(iconNode, finalThemeForIcon, { isIcon: true });
            }

            uiSvg = `
                <g class="unit-of-information-icon" id="${ui.id}" transform="translate(${relX}, ${relY})">
                    ${renderedIcon}
                </g>
            `;
        }
      }
      
      // FALLBACK: IF NO ENTITY NAME (or function not found), RENDER AS A STANDARD RECTANGLE
      if (!uiSvg) {
        uiSvg = `
          <g class="unit-of-information" id="${ui.id}" transform="translate(${relX}, ${relY})">
            <rect width="${ui.width}" height="${ui.height}" rx="0" ry="0" 
                  fill="${uiColors.fill}" stroke="${uiColors.stroke}" stroke-width="1" />
            <text x="${ui.width / 2}" y="${ui.height / 2}" 
                  text-anchor="middle" dominant-baseline="central" 
                  font-family="Arial, Helvetica, sans-serif" font-size="9" 
                  fill="${uiColors.text}">
              ${ui.label}
            </text>
          </g>
        `;
      }
      
      svgParts.push(uiSvg);
    });
  }

  return svgParts.join("\n");
}

/**
 * 1. MULTIMER MARKER: Draws the "stack" effect behind the main node.
 * This should be rendered FIRST (at the back).
 */
function renderMultimerMarker(node) {
  if (!node.isMultimer) return "";

  const offset = 6;
  const strokeColor = node.strokeColor || themes.cool.multimerMarker.fallbackStroke;
  const type = node.type || '';

  // 1. Düğüm tipine göre doğru KENARLIK yolunu (border path) oluşturalım
  let borderPath = "";
  if (type.includes('complex')) {
    const cut = Math.min(node.width, node.height) * 0.15;
    borderPath = `<path d="M ${cut},0 L ${node.width-cut},0 L ${node.width},${cut} L ${node.width},${node.height-cut} L ${node.width-cut},${node.height} L ${cut},${node.height} L 0,${node.height-cut} L 0,${cut} Z" />`;
  } else if (type.includes('simple chemical')) {
    const cornerRadius = node.height / 2;
    borderPath = `<rect width="${node.width}" height="${node.height}" rx="${cornerRadius}" ry="${cornerRadius}" />`;
  } else {
    const rx = 8;
    borderPath = `<rect width="${node.width}" height="${node.height}" rx="${rx}" ry="${rx}" />`;
  }

  // 2. Eğer düğüm aynı zamanda KLON ise, arkadaki kopya için de KLON DOLGUSUNU çizelim
  let cloneFill = "";
  if (node.isClone) {
    // Akıllı renderCloneMarker fonksiyonumuzdan doğru klon yolunu alıyoruz.
    // Bu fonksiyon zaten tüm şekil tiplerini (complex, simple chemical vb.) tanıyor.
    cloneFill = renderCloneMarker(node);
  }

  // 3. Nihai SVG'yi doğru katmanlama ile birleştir
  return `
    <g class="multimer-marker" transform="translate(${offset}, ${offset})">
      <!-- Önce klon dolgusunu çiz (altta kalacak) -->
      ${cloneFill}
      <!-- Sonra kenarlığı üzerine çiz (daha net görünür) -->
      <g fill="none" stroke="${strokeColor}" stroke-width="1.5">
        ${borderPath}
      </g>
    </g>
  `;
}


/**
 * Draws the clone marker (filled bottom area) with PERFECT geometry
 * for each specific node type (Octagon, Stadium, Rectangle).
 */
function renderCloneMarker(node) {
  if (!node.isClone) return "";

  const { width, height } = node;
  const type = node.type || '';
  const cloneHeight = type.includes('complex') ? height * 0.20 : height * 0.30;
  const startY = height - cloneHeight;
  const inset = 0.5;
  const fillColor = themes.cool.cloneMarker.fill;

  let clonePath = "";

  // Düğüm tipine göre doğru kesit yolunu çiz
  if (type.includes('complex')) {
    const cut = Math.min(width, height) * 0.15;
    clonePath = `
      <path d="M ${inset} ${startY} L ${width - inset} ${startY} L ${width - inset} ${height - cut} L ${width - cut} ${height - inset} L ${cut} ${height - inset} L ${inset} ${height - cut} Z" />
    `;
  } else if (type.includes('simple chemical')) {
    const radius = height / 2;
    clonePath = `
      <path d="M ${inset} ${startY} L ${width - inset} ${startY} L ${width - inset} ${height - radius} A ${radius - inset} ${radius - inset} 0 0 1 ${width - radius - inset} ${height - inset} L ${radius + inset} ${height - inset} A ${radius - inset} ${radius - inset} 0 0 1 ${inset} ${height - radius} Z" />
    `;
  } else {
    // Varsayılan: Macromolecule için yuvarlak dikdörtgen kesiti
    const rx = 8;
    clonePath = `
      <path d="M ${inset} ${startY} L ${width - inset} ${startY} L ${width - inset} ${height - rx} Q ${width - inset} ${height - inset} ${width - inset - rx} ${height - inset} L ${rx + inset} ${height - inset} Q ${inset} ${height - inset} ${inset} ${height - rx} Z" />
    `;
  }

  return `<g class="clone-marker" fill="${fillColor}" stroke="none">${clonePath}</g>`;
}

/**
 * Renders an SBGN arc (edge) with boundaries calculated via math.
 * @param {Object} edge - The edge object from the parser.
 * @param {Object} sourceNode - The starting node.
 * @param {Object} targetNode - The ending node.
 * @returns {string} - The SVG line element.
 */
function renderEdge(edge, sourceNode, targetNode, theme) {
  // 1. Calculate the exact boundary intersection points!
  // Start of the line: Intersection on the SOURCE node
  const startPoint = getBoundaryPoint(targetNode, sourceNode); 
  
  // End of the line: Intersection on the TARGET node
  const endPoint = getBoundaryPoint(sourceNode, targetNode);

  const x1 = startPoint.x;
  const y1 = startPoint.y;
  let x2 = endPoint.x;
  let y2 = endPoint.y;

  const edgeColors = theme.edge;

  // ... (The rest of the switch statement for styling remains exactly the same)
  let markerEnd = "none";
  let strokeColor = edgeColors.defaultStroke;
  let strokeWidth = "1.5";
  let strokeDasharray = "none";

  switch (edge.type) {
    case 'consumption': markerEnd = "none"; break;
    case 'production': markerEnd = "url(#marker-production)"; break;
    case 'modulation': markerEnd = "url(#marker-modulation)"; break;
    case 'unknown influence': markerEnd = "url(#marker-modulation)"; break;
    case 'stimulation': markerEnd = "url(#marker-stimulation)"; break;
    case 'positive influence': markerEnd = "url(#marker-stimulation)"; break;
    case 'catalysis': markerEnd = "url(#marker-catalysis)"; break;
    case 'inhibition':
    case 'negative influence':
      markerEnd = "url(#marker-inhibition)"; 
      strokeColor = edgeColors.inhibitionStroke; 
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const gap = 2; 
      x2 = x2 - (Math.cos(angle) * gap);
      y2 = y2 - (Math.sin(angle) * gap);
      break;
    case 'necessary stimulation': markerEnd = "url(#marker-necessary-stimulation)"; break;
    case 'logic arc': strokeWidth = "1"; break;
    case 'equivalence arc': 
      strokeColor = edgeColors.equivalenceStroke; 
      break;
    default: break;
  }

  // 3. Render the SVG Line using the exact boundary coordinates
  return `
    <line id="${edge.id}" class="arc ${edge.type.replace(" ", "-")}"
          x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
          stroke="${strokeColor}" 
          stroke-width="${strokeWidth}" 
          stroke-dasharray="${strokeDasharray}"
          marker-end="${markerEnd}" />
  `;
}

function renderGenericNode(node) {
    return `<rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" fill="none" stroke="red" />`;
}

/**
 * Calculates the intersection point between a line segment and a node's boundary.
 * @param {Object} source - The node where the line starts.
 * @param {Object} target - The node where the line ends (we need the intersection on THIS node's border).
 * @returns {Object} {x, y} coordinates of the intersection point.
 */
function getBoundaryPoint(source, target) {
  // Center point of the source node
  const sx = source.x + source.width / 2;
  const sy = source.y + source.height / 2;

  // Center point of the target node
  const tx = target.x + target.width / 2;
  const ty = target.y + target.height / 2;

  // Determine the shape type of the target node to use the correct math
  const shapeType = target.type;

  // Nodes that are generally circular or elliptical
  // Add 'and', 'or', 'not' to the list of circular shapes
  if (['simple chemical', 'unspecified entity', 'phenotype', 'association', 'dissociation', 'and', 'or', 'not'].includes(shapeType)) {
    return getEllipseIntersection(sx, sy, tx, ty, target.width / 2, target.height / 2);
  } 
  // Default to rectangular bounding box for macromolecules, processes, complexes, etc.
  else {
    return getRectangleIntersection(sx, sy, tx, ty, target.width, target.height);
  }
}

/**
 * Calculates the intersection of a line with an Ellipse.
 */
function getEllipseIntersection(sx, sy, tx, ty, rx, ry) {
  const dx = sx - tx;
  const dy = sy - ty;

  // If the points are exactly the same, return the center (avoids division by zero)
  if (dx === 0 && dy === 0) return { x: tx, y: ty };

  // Angle of the line from target to source
  const angle = Math.atan2(dy, dx);

  // Parametric equation for the point on the ellipse
  const ix = tx + rx * Math.cos(angle);
  const iy = ty + ry * Math.sin(angle);

  return { x: ix, y: iy };
}

/**
 * Calculates the intersection of a line with a Rectangle.
 */
function getRectangleIntersection(sx, sy, tx, ty, w, h) {
  const dx = sx - tx;
  const dy = sy - ty;

  if (dx === 0 && dy === 0) return { x: tx, y: ty };

  // Half-width and half-height of the target rectangle
  const hw = w / 2;
  const hh = h / 2;

  // Calculate the scale factors to hit the horizontal or vertical boundaries
  const scaleX = hw / Math.abs(dx);
  const scaleY = hh / Math.abs(dy);

  // The actual intersection is determined by whichever scale factor is smaller
  // (i.e., which boundary the line hits first)
  const scale = Math.min(scaleX, scaleY);

  const ix = tx + dx * scale;
  const iy = ty + dy * scale;

  return { x: ix, y: iy };
}

/**
 * Renders SVG text inside a node.
 * Strictly prioritizes word-wrapping (splitting by spaces) over scaling down the font.
 *
 * @param {string} label - The text to render.
 * @param {number} nodeWidth - The available width.
 * @param {number} nodeHeight - The available height.
 * @param {number} baseFontSize - The ideal font size.
 * @param {string} textColor - The color of the text.
 * @param {string} [fontWeight='bold'] - The font weight ('bold' or 'normal').
 * @returns {string} The SVG <text> element.
 */
function renderFitText(label, nodeWidth, nodeHeight, baseFontSize, textColor, fontWeight = 'bold') {
  if (!label) return "";

  const paddingX = 10; // Sağdan soldan 5'er piksel boşluk
  const availableWidth = nodeWidth - paddingX;
  
  // Bir karakterin ortalama genişliği (Arial fontu için genellikle font boyutunun %60'ı kadardır)
  const charWidthFactor = 0.6; 

  // 1. SBGN dosyasından gelen manuel satır sonlarını (\n veya &#xA;) ve boşlukları ayır
  let rawLines = label.split(/\n|&#xA;/);
  let lines = [];

  // 2. Akıllı Satır Kaydırma (Word Wrap) Mantığı
  rawLines.forEach(rawLine => {
    let words = rawLine.split(/\s+/); // Boşluklardan kelimelere ayır
    let currentLine = "";

    words.forEach(word => {
      // Mevcut satıra bu kelimeyi eklersek ne olur?
      let testLine = currentLine ? currentLine + " " + word : word;
      let testWidth = testLine.length * baseFontSize * charWidthFactor;

      // Eğer sığmıyorsa ve satır boş değilse, mevcut satırı bitir, kelimeyi YENİ satıra at
      if (testWidth > availableWidth && currentLine !== "") {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine; // Sığıyorsa satıra eklemeye devam et
      }
    });
    
    // Kalan son satırı da ekle
    if (currentLine) {
      lines.push(currentLine);
    }
  });

  // 3. Küçültme (Scaling) Kontrolü - SADECE ZORUNLUYSA
  // En uzun satırı bul
  let longestLineLen = Math.max(...lines.map(l => l.length));
  let maxLineWidth = longestLineLen * baseFontSize * charWidthFactor;
  
  let scaleX = 1;
  if (maxLineWidth > availableWidth) {
    scaleX = availableWidth / maxLineWidth; // Tek bir kelime bile sığmıyorsa mecburen küçült
  }

  let totalHeight = lines.length * (baseFontSize * 1.2);
  let availableHeight = nodeHeight - 10;
  let scaleY = 1;
  if (totalHeight > availableHeight) {
    scaleY = availableHeight / totalHeight; // Çok fazla satır olduysa dikeyden küçült
  }

  // Sadece küçültme yap (büyütme yapma) ve minimum 8px fonta izin ver
  let scale = Math.min(scaleX, scaleY, 1); 
  let finalFontSize = Math.max(baseFontSize * scale, 8);

  // 4. SVG'yi Oluştur
  let lineHeight = finalFontSize * 1.2;
  // Satır sayısına göre dikeyde tam merkeze hizalamak için başlangıç Y noktasını hesapla
  let startY = (nodeHeight / 2) - ((lines.length - 1) * lineHeight) / 2;

  // text-anchor="middle" sayesinde x her zaman nodeWidth / 2 kalabilir
  let textSvg = `<text x="${nodeWidth / 2}" y="${startY}" 
                      text-anchor="middle" dominant-baseline="central" 
                      font-family="Arial, Helvetica, sans-serif" 
                      font-size="${finalFontSize.toFixed(1)}" 
                      font-weight="${fontWeight}" fill="${textColor}">`;
  
  lines.forEach((line, index) => {
    let dy = index === 0 ? 0 : lineHeight;
    textSvg += `<tspan x="${nodeWidth / 2}" dy="${dy}">${line}</tspan>`;
  });

  textSvg += `</text>`;
  return textSvg;
}