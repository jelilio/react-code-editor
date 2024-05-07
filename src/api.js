import axios from "axios";
import { LANGUAGE_VERSIONS } from "./constants";

const API = axios.create({
  // baseURL: "https://emkc.org/api/v2/piston",
  baseURL: "http://127.0.0.1:8000",
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
