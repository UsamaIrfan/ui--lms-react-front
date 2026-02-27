import { defineConfig } from "orval";
import { config } from "dotenv";

// Load .env and .env.local so process.env picks up variables like NEXT_PUBLIC_ORVAL_API_URL
config({ path: ".env" });

export default defineConfig({
  api: {
    input: {
      target: process.env.ORVAL_INPUT_URL || "http://localhost:3000/docs-json",
    },
    output: {
      mode: "tags-split",
      target: "./src/services/api/generated",
      schemas: "./src/services/api/generated/model",
      client: "react-query",
      httpClient: "fetch",
      baseUrl: process.env.NEXT_PUBLIC_ORVAL_API_URL || "http://localhost:3000",
      override: {
        mutator: {
          path: "./src/services/api/generated/custom-fetch.ts",
          name: "customFetch",
        },
        query: {
          useQuery: true,
          useSuspenseQuery: false,
          useInfinite: true,
          useInfiniteQueryParam: "page",
        },
      },
    },
  },
});
