import { NextRequest, NextResponse } from "next/server";
import { getCategories, getGroups, logSearch, searchAndLogGroups } from "@/lib/data";
import { detectCategory, detectLocation } from "@/lib/search";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as {
      query?: string;
      category?: string;
    } | null;

    if (!body) {
      return NextResponse.json({ error: "A JSON request body is required." }, { status: 400 });
    }

    const query = body.query?.trim();

    if (!query) {
      return NextResponse.json({ error: "Query is required." }, { status: 400 });
    }

    if (body.category) {
      const [categories, allGroups] = await Promise.all([getCategories(), getGroups({ includeArchived: true })]);
      const category = categories.find((item) => item.slug === body.category || item.name.toLowerCase() === body.category?.toLowerCase());
      const matchedCategory = category?.name ?? detectCategory(query, categories);
      const matchedLocation = detectLocation(query, allGroups);
      const results = await getGroups({
        query,
        category: category?.slug ?? body.category,
        location: matchedLocation ?? undefined
      });
      const resultsFound = results.length > 0;

      await logSearch({
        query,
        matchedCategory,
        matchedLocation,
        resultsFound
      });

      return NextResponse.json({
        results,
        matchedCategory,
        matchedLocation,
        resultsFound
      });
    }

    const data = await searchAndLogGroups(query);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Search API failed", error);
    return NextResponse.json({ error: "Unable to search groups." }, { status: 500 });
  }
}
