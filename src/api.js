import axios from "axios";
import { LANGUAGE_VERSIONS } from "./constants";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const COMPILER_CHANNEL = import.meta.env.VITE_COMPILER_CHANNEL;
export const WS_URL = import.meta.env.VITE_WS_URL;

const API = axios.create({
  baseURL: API_BASE_URL,
});

export const executeCode = async (language, sourceCode) => {
  const response = await API.post("/execute", {
    language: language,
    version: LANGUAGE_VERSIONS[language],
    files: [
      {
        content: sourceCode,
      },
    ],
  });
  return response.data;
};
