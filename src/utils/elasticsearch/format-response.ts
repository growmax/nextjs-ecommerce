import isArray from "lodash/isArray";
import remove from "lodash/remove";

interface ElasticHit<T extends Record<string, unknown> = Record<string, unknown>> {
  _source: T;
  _id: string;
}

interface ElasticHitsResponse<T extends Record<string, unknown> = Record<string, unknown>> {
  hits: {
    hits: ElasticHit<T>[];
  };
}

interface ElasticResponse<T extends Record<string, unknown> = Record<string, unknown>> {
  data?: T[] | ElasticHitsResponse<T>;
  hits?: {
    hits: ElasticHit<T>[];
  };
}

type FormattedDocument<T extends Record<string, unknown> = Record<string, unknown>> = T & {
  id: string;
  buildNum?: unknown;
  notExpandable?: unknown;
};

export function formatElasticResponse<T extends Record<string, unknown> = Record<string, unknown>>(
  response: ElasticResponse<T>
): FormattedDocument<T>[] {
  const formattedResults: FormattedDocument<T>[] = [];

  if (response.data && isArray(response.data)) {
    return response.data.map((doc) => ({
      ...doc,
      id: (doc as any).id || "",
    })) as FormattedDocument<T>[];
  }

  const processHits = (hits: ElasticHit<T>[]) => {
    hits.forEach((hit) => {
      const documentWithId: FormattedDocument<T> = {
        ...hit._source,
        id: hit._id,
      };
      formattedResults.push(documentWithId);
    });
  };

  if (response.data && "hits" in response.data) {
    processHits(response.data.hits.hits);
  }

  if (response.hits) {
    processHits(response.hits.hits);
  }

  remove(
    formattedResults,
    (doc: FormattedDocument<T>) => doc.buildNum || doc.notExpandable
  );

  return formattedResults;
}
