import type {
  BaselineResponse,
  ScenarioData,
  AllCases,
  ClimateData,
} from "../types/farm";

const BASE = "/api";

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  getBaseline: () => fetchJSON<BaselineResponse>(`${BASE}/baseline`),

  updateBaseline: (data: Record<string, number>) =>
    fetchJSON<BaselineResponse>(`${BASE}/baseline`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  calculate: (params: Record<string, number>) =>
    fetchJSON<{ results: AllCases }>(`${BASE}/calculate`, {
      method: "POST",
      body: JSON.stringify(params),
    }),

  getScenarios: () => fetchJSON<ScenarioData[]>(`${BASE}/scenarios`),

  createScenario: (data: { name: string; description?: string } & Record<string, unknown>) =>
    fetchJSON<ScenarioData>(`${BASE}/scenarios`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateScenario: (id: number, data: Record<string, unknown>) =>
    fetchJSON<ScenarioData>(`${BASE}/scenarios/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteScenario: (id: number) =>
    fetchJSON<{ message: string }>(`${BASE}/scenarios/${id}`, {
      method: "DELETE",
    }),

  getClimate: (startYear = 2010, endYear?: number) => {
    const params = new URLSearchParams({ start_year: String(startYear) });
    if (endYear) params.set("end_year", String(endYear));
    return fetchJSON<ClimateData>(`${BASE}/climate?${params}`);
  },
};
