import { Router, Request, Response } from "express";
import { LivroRepository } from "../repository/LivroRepository";
import type { Livro } from "@prisma/client";

const router = Router();
const repo = new LivroRepository();

function validateLivroPayload(payload: any): string | null {
  if (!payload.titulo || typeof payload.titulo !== "string") return "Campo 'titulo' é obrigatório e deve ser string.";
  if (!payload.autor || typeof payload.autor !== "string") return "Campo 'autor' é obrigatório e deve ser string.";
  if (!payload.isbn || typeof payload.isbn !== "string") return "Campo 'isbn' é obrigatório e deve ser string.";
  if (payload.anoPublicacao === undefined || typeof payload.anoPublicacao !== "number") return "Campo 'anoPublicacao' é obrigatório e deve ser number.";
  if (payload.disponivel !== undefined && typeof payload.disponivel !== "boolean") return "Campo 'disponivel' deve ser boolean quando fornecido.";
  return null;
}

// criar os livros
router.post("/", async (req: Request, res: Response) => {
  try {
    const err = validateLivroPayload(req.body);
    if (err) return res.status(400).json({ error: err });

    
    const existentes = await repo.findAll();
    if (existentes.some((l) => l.isbn === req.body.isbn)) {
      return res.status(409).json({ error: "ISBN já cadastrado." });
    }

    const novo = await repo.create(req.body as Omit<Livro, "id">);
    return res.status(201).json(novo);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao criar livro." });
  }
});


router.get("/", async (req: Request, res: Response) => {
  try {
    const busca = req.query.busca as string | undefined;
    let livros = await repo.findAll();
    
    if (busca) {
      const buscaLower = busca.toLowerCase();
      livros = livros.filter(l => 
        l.titulo.toLowerCase().includes(buscaLower) ||
        l.autor.toLowerCase().includes(buscaLower) ||
        l.isbn.toLowerCase().includes(buscaLower)
      );
    }
    
    return res.json(livros);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar livros." });
  }
});


router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const livro = await repo.findById(id);
    if (!livro) return res.status(404).json({ error: "Livro não encontrado." });
    return res.json(livro);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar livro." });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const err = validateLivroPayload(req.body);
    if (err) return res.status(400).json({ error: err });

    
    const existentes = await repo.findAll();
    if (existentes.some((l) => l.isbn === req.body.isbn && l.id !== id)) {
      return res.status(409).json({ error: "ISBN já cadastrado em outro livro." });
    }

    const atualizado = await repo.update(id, req.body as Partial<Livro>);
    if (!atualizado) return res.status(404).json({ error: "Livro não encontrado." });
    return res.json(atualizado);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao atualizar livro." });
  }
});


router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (req.body.isbn) {
      const existentes = await repo.findAll();
      if (existentes.some((l) => l.isbn === req.body.isbn && l.id !== id)) {
        return res.status(409).json({ error: "ISBN já cadastrado em outro livro." });
      }
    }

    const atualizado = await repo.update(id, req.body as Partial<Livro>);
    if (!atualizado) return res.status(404).json({ error: "Livro não encontrado." });
    return res.json(atualizado);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao atualizar livro." });
  }
});


router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ok = await repo.delete(id);
    if (!ok) return res.status(404).json({ error: "Livro não encontrado." });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Erro ao deletar livro." });
  }
});

export default router;
