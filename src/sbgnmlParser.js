import { XMLParser } from "fast-xml-parser";

/**
 * Parses an SBGN-ML string into a structured graph object.
 * @param {string} sbgnml - The raw XML content of the SBGN-ML file.
 * @returns {Object} An object containing nodes (with states and UIs) and edges.
 */
export function parseSbgnml(sbgnml) {
  // Configure the parser to ensure specific tags are always treated as arrays
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    isArray: (name) => {
      const alwaysArray = ["map", "glyph", "arc", "port", "stateVariable", "unitOfInformation"];
      return alwaysArray.includes(name);
    }
  });

  const xml = parser.parse(sbgnml);
  const sbgn = xml.sbgn;

  if (!sbgn || !sbgn.map || sbgn.map.length === 0) {
    throw new Error("Invalid SBGN-ML: <sbgn> or <map> elements are missing.");
  }

  // Access the first map element
  const map = sbgn.map[0]; 

  const nodes = [];
  const edges = [];

  /**
   * Navigates the complex RDF annotation structure to find the first resource URL.
   * @param {Object} glyph - The glyph object from the parser.
   * @returns {string|null} - The found URL or null.
   */
  function extractAnnotationLink(glyph) {
    try {
      const annotation = glyph.extension?.annotation;
      if (!annotation) return null;

      // RDF/XML yapısı genellikle bu sırayı izler
      const rdfDescription = annotation['rdf:RDF']?.['rdf:Description'];
      if (!rdfDescription) return null;

      // Tüm 'is' veya 'hasPart' gibi niteleyicileri kontrol et
      for (const key in rdfDescription) {
        if (key.includes('is') || key.includes('hasPart')) {
          const bag = rdfDescription[key]?.['rdf:Bag'];
          if (bag) {
            const li = bag['rdf:li'];
            if (Array.isArray(li) && li.length > 0) {
              // Eğer birden fazla link varsa, ilkini al
              return li[0]['rdf:resource'];
            } else if (li) {
              // Eğer sadece bir tane varsa
              return li['rdf:resource'];
            }
          }
        }
      }
    } catch (e) {
      // Hata olursa görmezden gel ve devam et
      console.warn("Could not parse a complex annotation structure.", e);
    }
    return null;
  }

  /**
   * Recursively processes glyphs to handle nesting and auxiliary elements.
   * @param {Object} g - The glyph object from the parser.
   * @param {string|null} parentId - The ID of the parent glyph (e.g., for compartments or complexes).
   */
  const processGlyph = (g, parentId = null) => {
    // Skip auxiliary elements as they are handled within their parent node
    if (g.class === "state variable" || g.class === "unit of information") return;

    const stateVariables = [];
    const unitsOfInformation = [];
    const nestedGlyphs = [];

    // Process child glyphs if they exist
    if (g.glyph) {
      g.glyph.forEach(child => {
        if (child.class === "state variable") {
          stateVariables.push({
            id: child.id,
            value: child.state?.value || "",
            variable: child.state?.variable || "",
            x: parseFloat(child.bbox?.x || 0),
            y: parseFloat(child.bbox?.y || 0),
            width: parseFloat(child.bbox?.w || 0),
            height: parseFloat(child.bbox?.h || 0)
          });
        } 
        else if (child.class === "unit of information") {
          unitsOfInformation.push({ 
            id: child.id,
            label: child.label?.text || "", 
            x: parseFloat(child.bbox?.x || 0),
            y: parseFloat(child.bbox?.y || 0),
            width: parseFloat(child.bbox?.w || 0),
            height: parseFloat(child.bbox?.h || 0),
            entityName: child.entity?.name ? (child.entity?.name == "perturbation" ? "perturbing agent" : child.entity?.name): child.entity?.name || null 
          });
        }
        else {
          // Identify nested nodes (e.g., molecules inside a complex)
          nestedGlyphs.push(child);
        }
      });
    }

    // Push the main node data
    nodes.push({
      id: g.id,
      type: g.class,
      label: g.label?.text || "",
      x: parseFloat(g.bbox?.x || 0),
      y: parseFloat(g.bbox?.y || 0),
      width: parseFloat(g.bbox?.w || 0),
      height: parseFloat(g.bbox?.h || 0),
      parentId: parentId || g.compartmentRef || null,
      stateVariables,
      unitsOfInformation,
      isClone: g.hasOwnProperty('clone'),
      isMultimer: typeof g.class === 'string' && g.class.includes('multimer'),
      link: extractAnnotationLink(g)
    });

    // Recursively process nested glyphs
    nestedGlyphs.forEach(child => processGlyph(child, g.id));
  };

  // 1. Process all top-level nodes (Glyphs)
  if (map.glyph) {
    map.glyph.forEach(g => processGlyph(g));
  }

  // 2. Process all connections (Edges / Arcs)
  if (map.arc) {
    map.arc.forEach(a => {
      edges.push({
        id: a.id,
        source: a.source,
        target: a.target,
        type: a.class // e.g., "production", "inhibition", "catalysis"
      });
    });
  }

  return { nodes, edges };
}