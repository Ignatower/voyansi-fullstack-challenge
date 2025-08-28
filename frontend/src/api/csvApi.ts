import axios from "axios";
import type { CSVRow } from "../types/CSVRow";
import type { ApiResponse } from "../types/ApiResponse";

const API_BASE_URL = "http://localhost:3000";

const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers,
});

// Helper to handle errors
const handleAxiosError = (err: unknown) => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.error || err.message;
  }
  return "Unknown error";
};

export const getCSVData = async (): Promise<ApiResponse<CSVRow[]>> => {
  try {
    const response = await api.get("/api/data");
    const data = (response?.data?.data as CSVRow[]) || [];
    return { data, error: null };
  } catch (err) {
    return { data: null, error: handleAxiosError(err) };
  }
};
