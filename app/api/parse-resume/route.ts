import { NextResponse } from "next/server";

export async function POST(
  request: Request
) {
  const formData = await request.formData();

  const file = formData.get("resume") as File;

  return NextResponse.json({
    success: true,
    fileName: file?.name,
  });
}