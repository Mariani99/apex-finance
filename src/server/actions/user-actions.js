"use server";

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;

export async function get_prospecFunnels() { //pega lista de etapas do funil
  try {
    const prospec_funnels = await prisma.prospecFunnel.findMany({
      orderBy: [{ id: "asc" }],
      select: {
        id: true,
        name: true
      }
    });

    return prospec_funnels;
  } catch (error) {
    console.error("Erro ao buscar funis:", error);
    return [];
  }
}

export async function getUsers() { //pega lista usuários
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    return users;
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return [];
  }
}