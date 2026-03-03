import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  if (!/^[a-z]{2,3}$/.test(code)) {
    return NextResponse.json(
      { error: "Invalid language code" },
      { status: 400 }
    );
  }

  const geoPath = path.join(
    process.cwd(),
    "plugins",
    "languages",
    "geo",
    `${code}.geojson`
  );

  if (!fs.existsSync(geoPath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data = fs.readFileSync(geoPath, "utf-8");
  return NextResponse.json(JSON.parse(data));
}
