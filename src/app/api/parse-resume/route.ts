import { NextResponse } from "next/server";
import { extractPdfText } from "../../../lib/pdf";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("resume") as File;

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const resumeText =
      await extractPdfText(buffer);

    console.log("========== PDF TEXT ==========");
    console.log(resumeText);
    console.log("==============================");

    return NextResponse.json({
      success: true,
      resumeText,
    });
  } catch (error) {
    console.error("PDF ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}