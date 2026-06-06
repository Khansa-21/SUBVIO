import { swaggerDocument } from "../docs/swagger/index.js";

export const swaggerUiOptions = {
  customSiteTitle: "Subscription Tracker API Docs",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    tagsSorter: "alpha",
    operationsSorter: "method",
  },
};

export default swaggerDocument;
