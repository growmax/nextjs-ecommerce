import OpenElasticSearchService from "@/lib/api/services/ElacticQueryService/openElasticSearch/openElasticSearch";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const term = (url.searchParams.get("term") || "").trim();
    const index = (url.searchParams.get("index") || "").trim();

    if (!term) {
      return NextResponse.json({ products: [], total: 0 });
    }

    const result = await OpenElasticSearchService.searchProductsServerSide(
      term,
      index
    );
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ products: [], total: 0 }, { status: 500 });
  }
}
