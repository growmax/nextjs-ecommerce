// Base API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: "success" | "error";
  timestamp: string;
}

export interface SearchParams {
  search?: string;
  searchFields?: string[];
}

export interface GetRequest {
  id: string;
}
