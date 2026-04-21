# sbgnml-to-figure
sbgnml-to-figure is a JavaScript library to convert SBGN-ML files into beautiful, publication-ready SVG figures.

Click [here](https://sciluna.github.io/sbgnml-to-figure/demo/demo.html) for a demo.

## Installation
Install via npm:

`npm install sbgnml-to-figure`

Or include it directly in your HTML via CDN (UMD bundle):

`<script src="https://unpkg.com/sbgnml-to-figure/dist/sbgnml-to-figure.umd.js"></script>`

## Usage
sbgnml-to-figure can be used in both Node.js environments and directly in the browser.

### 1. In Node.js (Server-side or Build Tools)
```
import { generate } from 'sbgnml-to-figure';
import fs from 'fs';

// 1. Read your SBGN-ML file
const sbgnmlContent = fs.readFileSync('./pathway.sbgn', 'utf8');

// 2. Generate the SVG string
const svgOutput = generate(sbgnmlContent, {
  theme: 'cool', // Options: 'cool', 'warm', 'bluescale', 'colorblind', 'blank'
  useParentThemeForIcons: true // icons here are auxiliary units in SBGN
});

// 3. Save the result
fs.writeFileSync('./paper_figure.svg', svgOutput);
```

### 2. In the Browser (Client-side)
If you are using the UMD bundle via a <script> tag, the library is exposed globally as SbgnmlToFigure.
```
<!DOCTYPE html>
<html>
<head>
    <title>SBGN Viewer</title>
    <!-- Include the library -->
    <script src="./dist/sbgnml-to-figure.umd.js"></script>
</head>
<body>
    <div id="viewer"></div>

    <script>
        // Assume 'xmlString' contains your SBGN-ML data (e.g., loaded via fetch or file input)
        const xmlString = `<?xml version="1.0" ...><sbgn>...</sbgn>`;
        
        // Generate the SVG with a specific theme
        const svgContent = SbgnmlToFigure.generate(xmlString, { 
            theme: 'cool' 
        });

        // Inject the SVG directly into the DOM
        document.getElementById('viewer').innerHTML = svgContent;
    </script>
</body>
</html>
```
### 3. CLI Usage
You can use `sbgnml-to-figure` directly from your command line without any setup, thanks to `npx`.

### Basic Conversion
Reads `input.sbgn` and saves the output to `output.svg`.

```
npx sbgnml-to-figure -i input.sbgn -o output.svg
```
Use the -t or --theme flag to specify a theme.
```
npx sbgnml-to-figure -i input.sbgn -o output.svg -t colorblind
```

All options:
```
Usage: sbgnml-to-figure [input-file] [options]

Options:
  -i, --input <file>    Specify the input SBGN-ML file.
  -o, --output <file>   Specify the output SVG file. (Prints to stdout if omitted)
  -t, --theme <name>    Specify the theme. (default: "cool")
  --use-parent-theme    Force UI icons to use their parent's theme.
  -h, --help            Display this help message.
```
