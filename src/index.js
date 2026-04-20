import { parseSbgnml } from "./sbgnmlParser.js"
import { renderGraphToSVG } from "./renderer.js";

/**
 * Main function to transform SBGN-ML content into a high-quality, paper-ready SVG.
 * @param {string} sbgnml - The raw XML string from an .sbgnml file.
 * @param {Object} options - Configuration options (e.g., for simplifying or styling).
 * @returns {string} - A complete, standalone SVG string.
 */
export function generate(sbgnml, options = {}) {
  try {
    // 1. Parse the SBGN-ML into our internal JSON graph structure
    const graph = parseSbgnml(sbgnml);

    if (options.debug) {
      console.log("Successfully parsed graph data:", graph);
    }

    // 2. Render the parsed graph into a "fancy" SVG
    // DİKKAT: Kullanıcıdan gelen 'options' objesini doğrudan renderGraphToSVG'ye İLETİYORUZ!
    const svgOutput = renderGraphToSVG(graph, options);

    // 3. Return the final SVG string
    return svgOutput;

  } catch (error) {
    console.error("Error generating SBGN figure:", error.message);
    throw error;
  }
}