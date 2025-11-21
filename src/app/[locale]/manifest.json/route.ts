import { readFile } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Read the manifest.json file from the public directory
    const manifestPath = join(process.cwd(), "public", "manifest.json");
    const manifestContent = await readFile(manifestPath, "utf-8");
    const manifest = JSON.parse(manifestContent);

    // Return the manifest with proper content type
    return NextResponse.json(manifest, {
      headers: {
        "Content-Type": "application/manifest+json",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error reading manifest.json:", error);
    return NextResponse.json(
      { error: "Manifest not found" },
      { status: 404 }
    );
  }
}

