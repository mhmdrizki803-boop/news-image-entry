import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const sourcePath = join(process.cwd(), "entry.png");
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const outputPath = join(outputDir, "entry.png");
const maxBytes = 1024 * 1024;

async function main(): Promise<void> {
  let image: Buffer;

  try {
    image = await readFile(sourcePath);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Source image is missing or unreadable: ${sourcePath} (${detail})`);
  }

  if (image.length > maxBytes) {
    throw new Error(
      `Source image exceeds the 1 MiB limit: ${image.length} bytes at ${sourcePath}`,
    );
  }

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, image);

  const writtenImage = await readFile(outputPath);
  if (!writtenImage.equals(image)) {
    throw new Error(
      `Output verification failed: ${outputPath} does not exactly match ${sourcePath}`,
    );
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`make.fun entry failed: ${message}`);
  process.exitCode = 1;
});
// I verified that the program copies and validates the image byte for byte.
