import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";

import { ARCJET_KEY } from "./env.js";

let aj = null;

if (ARCJET_KEY) {
  aj = arcjet({
    key: ARCJET_KEY,
    rules: [
      shield({ mode: "LIVE" }),
      
      detectBot({
        mode: "LIVE",
        allow: ["CATEGORY:SEARCH_ENGINE"],
      }),

      tokenBucket({
        mode: "LIVE",
        refillRate: 5,
        interval: 10, 
        capacity: 10, 
      }),
    ],
  });
} else {
  console.warn("ARCJET_KEY not found - Arcjet protection is disabled");
}

export default aj;
