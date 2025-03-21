import fastify from "fastify";
import { createHelia } from "helia";

import { createPinningServiceAPIServer } from "@helia/pinning-service-api-server";

await createPinningServiceAPIServer(await createHelia(), {
  validateAccessToken: () => {
    return { id: "1" };
  },
  fastify: fastify({
    logger: true
  }),
  listen: {
    host: "127.0.0.1",
    port: 5005
  }
});
