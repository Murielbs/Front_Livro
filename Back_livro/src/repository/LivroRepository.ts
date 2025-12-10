import { prisma } from "../data-source";
import type { Livro } from "@prisma/client";

export class LivroRepository {
  async create(livro: Omit<Livro, "id">): Promise<Livro> {
    return prisma.livro.create({
      data: livro,
    });
  }

  findAll(): Promise<Livro[]> {
    return prisma.livro.findMany();
  }

  findById(id: string): Promise<Livro | null> {
    return prisma.livro.findUnique({
      where: { id },
    });
  }

  async update(id: string, dados: Partial<Livro>): Promise<Livro | null> {
    try {
      return await prisma.livro.update({
        where: { id },
        data: dados,
      });
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.livro.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }
}
