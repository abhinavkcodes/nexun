import { NextResponse } from "next/server";
import { extractPdfText } from "../../../lib/pdf";

export async function POST(
  request: Request
) {
  const formData = await request.formData();

  const file = formData.get("resume") as File;

  const bytes = await file.arrayBuffer();

  const buffer = Buffer.from(bytes);

  const resumeText =
    await extractPdfText(buffer);

  return NextResponse.json({
    success: true,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    resumeText,
  });
}