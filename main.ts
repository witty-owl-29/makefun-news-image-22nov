// Entry program for make.fun news-image-20261122.
// Copies the front-page image (entry.png, stored beside this file)
// into the output directory make.fun grades: MAKEFUN_OUTPUT_DIR,
// defaulting to /output. The copy is byte-for-byte, so repeated
// runs always write identical bytes.
//
// Before copying it validates the image, so a broken entry fails
// loudly instead of shipping bad bytes: the file must exist, be no
// larger than 1 MiB, and be no bigger than 1024 by 1024 pixels.
// Dimensions are read straight from the image header (JPEG SOF
// frame or PNG IHDR chunk) with no dependency.

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_BYTES = 1048576;
const MAX_SIDE = 1024;

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "entry.png");
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

function fail(message: string): never {
  console.error(`entry failed: ${message}`);
  process.exit(1);
}

if (!existsSync(source)) {
  fail(`entry.png not found beside main.ts (${source})`);
}

const bytes = readFileSync(source);
if (bytes.length > MAX_BYTES) {
  fail(`entry.png is ${bytes.length} bytes, over the 1 MiB limit`);
}

let width = 0;
let height = 0;
if (bytes[0] === 0xff && bytes[1] === 0xd8) {
  // JPEG: walk the segments until a Start Of Frame marker (0xC0-0xCF
  // except the Huffman/table markers) holds height then width.
  let p = 2;
  while (p + 9 < bytes.length) {
    if (bytes[p] !== 0xff) break;
    const marker = bytes[p + 1];
    const len = (bytes[p + 2] << 8) | bytes[p + 3];
    if (
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc
    ) {
      height = (bytes[p + 5] << 8) | bytes[p + 6];
      width = (bytes[p + 7] << 8) | bytes[p + 8];
      break;
    }
    p += 2 + len;
  }
} else if (
  bytes[0] === 0x89 &&
  bytes[1] === 0x50 &&
  bytes[2] === 0x4e &&
  bytes[3] === 0x47
) {
  // PNG: width and height are the first eight bytes of the IHDR chunk.
  width =
    (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19];
  height =
    (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23];
} else {
  fail("entry.png is neither a JPEG nor a PNG file");
}

if (width === 0 || height === 0) {
  fail("could not read entry.png dimensions");
}
if (width > MAX_SIDE || height > MAX_SIDE) {
  fail(`entry.png is ${width}x${height}, over the 1024x1024 limit`);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.png"), bytes);

console.log(`Wrote entry.png (${width}x${height}, ${bytes.length} bytes) to ${outDir}`);
