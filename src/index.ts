import { buildApp } from "./server";

async function startServer() {
  const app = buildApp();

  try {
    await app.listen({
      port:  Number(process.env.PORT ?? 3000),
      host: "0.0.0.0",
    });
    console.log(`running on port ${process.env.PORT ?? 3000}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

startServer();