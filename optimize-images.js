// optimize-images.js
import sharp from "sharp";
import fs from "fs";
import path from "path";

const inputDir = "."; // current directory
const outputDir = path.join(".", "optimized");

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

const files = fs.readdirSync(inputDir).filter(f => /^\d+\.jpe?g$/i.test(f));

console.log(`Found ${files.length} images to optimize...`);

async function optimizeAll() {
  for (const file of files) {
    const filePath = path.join(inputDir, file);
    const base = path.parse(file).name; // e.g. "1", "2"

    const out400 = path.join(outputDir, `${base}-400.webp`);
    const out800 = path.join(outputDir, `${base}-800.webp`);
    const out1600 = path.join(outputDir, `${base}-1600.webp`);
    const outBlur = path.join(outputDir, `${base}-blur.webp`);

    await sharp(filePath).resize(400).webp({ quality: 70 }).toFile(out400);
    await sharp(filePath).resize(800).webp({ quality: 70 }).toFile(out800);
    await sharp(filePath).resize(1600).webp({ quality: 70 }).toFile(out1600);
    await sharp(filePath).resize(20).blur(10).webp({ quality: 40 }).toFile(outBlur);

    console.log(`✅ Optimized ${file}`);
  }
  console.log("✨ All done! Optimized images saved in /optimized/");
}

optimizeAll();
