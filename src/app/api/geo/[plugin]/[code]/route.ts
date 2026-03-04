import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ plugin: string; code: string }> }
) {
  const { plugin, code } = await params;

  // Validate plugin name: alphanumeric + hyphens only
  if (!/^[a-z][a-z0-9-]*$/.test(plugin)) {
    return NextResponse.json(
      { error: "Invalid plugin name" },
      { status: 400 }
    );
  }

  // Validate code: alphanumeric + hyphens, 1-64 chars
  if (!/^[a-z0-9-]{1,64}$/.test(code)) {
    return NextResponse.json(
      { error: "Invalid code" },
      { status: 400 }
    );
  }

  const geoPath = path.join(
    process.cwd(),
    "plugins",
    plugin,
    "geo",
    `${code}.geojson`
  );

  if (!fs.existsSync(geoPath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data = fs.readFileSync(geoPath, "utf-8");
  return NextResponse.json(JSON.parse(data));
}
