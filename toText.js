import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, relative, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Specify the root directories
const routesDir = join(__dirname, 'src', 'routes');
const libDir = join(__dirname, 'src', 'lib');

// Create a mapping for common syntax/phrases
let syntaxMap = {};
let currentIndex = 0;

function getShortPlaceholder() {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    let shortPlaceholder = '';
    let index = currentIndex;

    while (index >= 0) {
        shortPlaceholder = alphabet[index % 26] + shortPlaceholder;
        index = Math.floor(index / 26) - 1;
    }

    currentIndex++;
    return shortPlaceholder;
}

// Function to minify code (removes whitespace and comments)
function minifyCode(code) {
    return code.replace(/\/\/.*|\/\*[\s\S]*?\*\/|[\r\n\t]+|\s{2,}/g, ' ');
}

// Function to read a file and return its content
function readFileContent(filePath) {
    try {
        return minifyCode(readFileSync(filePath, 'utf-8'));
    } catch (err) {
        console.error(`Error reading file ${filePath}:`, err);
        return '';
    }
}

// Function to recursively find files in a directory and filter by extensions
function findFiles(dir, extensions) {
    let results = [];
    const list = readdirSync(dir);

    list.forEach(file => {
        const filePath = join(dir, file);
        const stat = statSync(filePath);

        if (stat && stat.isDirectory()) {
            results = results.concat(findFiles(filePath, extensions));
        } else {
            const fileExt = extname(file);
            if (extensions.includes(fileExt)) {
                results.push(filePath);
            }
        }
    });

    return results;
}

// Function to replace frequent phrases with variable-length placeholders
function replaceFrequentPhrases(code) {
    const phraseRegex = /[\w\s.,:{}()[\]<>!+=\-*/%&|^?]+/g;
    const phrases = code.match(phraseRegex);

    if (!phrases) return code;

    const phraseCount = {};
    phrases.forEach(phrase => {
        if (phrase.length > 10) {
            phraseCount[phrase] = (phraseCount[phrase] || 0) + 1;
        }
    });

    const sortedPhrases = Object.keys(phraseCount).sort((a, b) => phraseCount[b] - phraseCount[a]);

    sortedPhrases.forEach((phrase, index) => {
        if (phraseCount[phrase] > 1) {
            const placeholder = getShortPlaceholder(); // Variable-length placeholder
            syntaxMap[phrase] = placeholder;
            const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            code = code.replace(regex, placeholder);
        }
    });

    return code;
}

// Function to aggregate all relevant files and process the code
function gatherCode() {
    let output = '// Instruction for ChatGPT: This file contains the entire SvelteKit Project, and functions from folder. Please analyse carefully and from the viewpoint of a expert programmer with senior knowledge. Suggest optimizations that are functional in nature, and only when a less elegant solution actually can cause issues. \n\n';
    output += '// === CODE SECTION ===\n\n';

    const extensions = ['.svelte', '.js', '.ts'];
    const allFiles = [
        ...findFiles(routesDir, extensions),
        ...findFiles(libDir, extensions)
    ];

    let aggregatedCode = '';
    allFiles.forEach(file => {
        const code = readFileContent(file);
        aggregatedCode += `\n// File: ${relative(__dirname, file)}\n\n${code}\n`;
    });

    const originalLength = aggregatedCode.length;

    const processedCode = aggregatedCode

    const newLength = processedCode.length + JSON.stringify(syntaxMap, null, 2).length;

    console.log(`Original aggregated text length: ${originalLength} characters`);
    console.log(`New text length (including mapping): ${newLength} characters`);
    console.log(`Reduction: ${((originalLength - newLength) / originalLength * 100).toFixed(2)}%`);

    output += processedCode;

    writeFileSync('gathered-code-with-mapping.txt', output, 'utf-8');
    console.log('Code with syntax replacement and mapping has been saved to gathered-code-with-mapping.txt');
}

gatherCode();