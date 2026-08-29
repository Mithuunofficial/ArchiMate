export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiEndpoint {
  id: string;
  method: HttpMethod;
  path: string;
  summary: string;
  tags?: string[];
  requestBody?: string; // JSON formatted string representation
  responseExample?: string; // JSON formatted string representation
}

export interface ApiSpecification {
  title: string;
  version: string;
  endpoints: ApiEndpoint[];
}
