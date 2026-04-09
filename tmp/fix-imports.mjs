import fs from 'fs';
import path from 'path';

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(file));
        } else if (file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const apiSrcDir = path.resolve('C:\\UShop\\development\\apps\\api\\src');
const tsFiles = walkDir(apiSrcDir);

let changedFilesCount = 0;
tsFiles.forEach((file) => {
    let content = fs.readFileSync(file, 'utf8');
    // regex to catch: import ... from './something.js'; or import './something.js';
    const newContent = content.replace(/(import\s+[^'"]*?['"])([^'"]+)\.js(['"])/g, '$1$2$3');
    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        changedFilesCount++;
        console.log(`Updated imports in: ${file}`);
    }
});

console.log(`Total files updated: ${changedFilesCount}`);
