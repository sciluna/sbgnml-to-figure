#!/usr/bin/env node

// This line above is the "shebang". It tells the system to execute this file with Node.js.

import fs from 'fs';
import path from 'path';
import { generate } from '../src/index.js'; // Import your main function

// --- A simple command-line argument parser ---
const args = process.argv.slice(2);
let inputFile = null;
let outputFile = null;
let theme = 'cool'; // Default theme
let useParentTheme = false;

for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
        case '-i':
        case '--input':
            inputFile = args[++i];
            break;
        case '-o':
        case '--output':
            outputFile = args[++i];
            break;
        case '-t':
        case '--theme':
            theme = args[++i];
            break;
        case '--use-parent-theme':
            useParentTheme = true;
            break;
        case '-h':
        case '--help':
            printHelp();
            process.exit(0);
        default:
            if (!inputFile) inputFile = args[i];
            break;
    }
}

if (!inputFile) {
    console.error('Error: Input file must be provided.');
    printHelp();
    process.exit(1);
}

// --- Main execution logic ---
try {
    const sbgnmlContent = fs.readFileSync(inputFile, 'utf8');

    const options = {
        theme: theme,
        useParentThemeForIcons: useParentTheme,
    };

    const svgOutput = generate(sbgnmlContent, options);

    if (outputFile) {
        fs.writeFileSync(outputFile, svgOutput);
        console.log(`✨ Successfully generated figure and saved to ${outputFile}`);
    } else {
        // If no output file is specified, print to standard output
        process.stdout.write(svgOutput);
    }
} catch (error) {
    console.error(`Error processing file: ${error.message}`);
    process.exit(1);
}

// --- Help Message ---
function printHelp() {
    console.log(`
Usage: sbgnml-to-figure [input-file] [options]

Converts an SBGN-ML file into a publication-ready SVG figure.

Options:
  -i, --input <file>    Specify the input SBGN-ML file.
  -o, --output <file>   Specify the output SVG file. (Prints to stdout if omitted)
  -t, --theme <name>    Specify the theme to use.
                        (cool, warm, colorblind, bluescale, blank)
                        (Default: "cool")
  --use-parent-theme    Force UI icons to use their parent's theme.
  -h, --help            Display this help message.
    `);
}