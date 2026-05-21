import { NextRequest, NextResponse } from "next/server";
import { createGroupRequest } from "@/lib/data";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    name?: string;
    whatsappNumber?: string;
    query?: string;
    category?: string;
    location?: string;
    notes?: string;
  } | null;

  if (!body?.query?.trim()) {
    return NextResponse.json({ error: "Please tell us what group you are looking for." }, { status: 400 });
  }

  try {
    const groupRequest = await createGroupRequest({
      name: body.name?.trim() || null,
      whatsappNumber: body.whatsappNumber?.trim() || null,
      query: body.query.trim(),
      category: body.category?.trim() || null,
      location: body.location?.trim() || null,
      notes: body.notes?.trim() || null
    });

    return NextResponse.json({ groupRequest }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "FriendlyBot could not save this request. Please try again or contact the Eclipse team."
      },
      { status: 500 }
    );
  }
}
