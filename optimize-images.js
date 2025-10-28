// optimize-images.js
import sharp from "sharp";
import fs from "fs";
import path from "path";

const inputDir = "."; // Your images are in the same folder as this script
const outputDir = path.join(".", "optimized");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const files = fs.readdirSync(inputDir).filter(file =>
  /\.(jpe?g|png)$/i.test(file)
);

console.log(`Found ${files.length} images to optimize...`);

async function optimize() {
  for (const file of files) {
    const filePath = path.join(inputDir, file);
    const base = path.parse(file).name;

    // Output paths
    const out400 = path.join(outputDir, `${base}-400.webp`);
    const out800 = path.join(outputDir, `${base}-800.webp`);
    const out1600 = path.join(outputDir, `${base}-1600.webp`);
    const outBlur = path.join(outputDir, `${base}-blur.webp`);

    try {
      // Small blurred placeholder
      await sharp(filePath)
        .resize(20)
        .blur(10)
        .webp({ quality: 40 })
        .toFile(outBlur);

      // 400px width
      await sharp(filePath)
        .resize(400)
        .webp({ quality: 70 })
        .toFile(out400);

      // 800px width
      await sharp(filePath)
        .resize(800)
        .webp({ quality: 70 })
        .toFile(out800);

      // 1600px width
      await sharp(filePath)
        .resize(1600)
        .webp({ quality: 70 })
        .toFile(out1600);

      console.log(`✅ Optimized ${file}`);
    } catch (err) {
      console.error(`❌ Failed to optimize ${file}:`, err);
    }
  }
  console.log("✨ All done! Optimized images saved in /optimized/");
}

optimize();
