import express from "express";
import livroRouter from "./controller/LivroController";
import { prisma } from "./data-source";

const app = express();

// CORS para permitir requisições do React Native
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use('/api/livros', livroRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
  console.log(`URL pública: https://cautious-couscous-x5v5v9vq7gx636w5q-3000.app.github.dev`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nFinalizando servidor...");
  await prisma.$disconnect();
  process.exit(0);
});

