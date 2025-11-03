import isArray from "lodash/isArray";
import remove from "lodash/remove";

interface ElasticHit<T = Record<string, unknown>> {
  _source: T;
  _id: string;
}

interface ElasticHitsResponse<T = Record<string, unknown>> {
  hits: {
    hits: ElasticHit<T>[];
  };
}

interface ElasticResponse<T = Record<string, unknown>> {
  data?: T[] | ElasticHitsResponse<T>;
  hits?: {
    hits: ElasticHit<T>[];
  };
}

type FormattedDocument<T = Record<string, unknown>> = T & {
  id: string;
  buildNum?: unknown;
  notExpandable?: unknown;
};

/**
 *
 * @param documents Elasticsearch response documents
 * @returns Array of formatted documents with id field
 */
export default function FormatElastic<T = Record<string, unknown>>(
  documents: ElasticResponse<T>
): FormattedDocument<T>[] {
  const formattedResults: FormattedDocument<T>[] = [];

  if (isArray(documents.data)) {
    return documents.data as FormattedDocument<T>[];
  }

  if (documents.data && "hits" in documents.data) {
    documents.data.hits.hits.forEach(function (documnt: ElasticHit<T>) {
      const documentSource = documnt._source;
      (documentSource as FormattedDocument<T>).id = documnt._id;
      formattedResults.push(documentSource as FormattedDocument<T>);
    });
  }

  if (documents.hits) {
    documents.hits.hits.forEach(function (documnt: ElasticHit<T>) {
      const documentSource = documnt._source;
      (documentSource as FormattedDocument<T>).id = documnt._id;
      formattedResults.push(documentSource as FormattedDocument<T>);
    });
  }

  remove(
    formattedResults,
    (o: FormattedDocument<T>) => o.buildNum || o.notExpandable
  );
  return formattedResults;
}
