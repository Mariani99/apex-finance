"use server";

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;

export async function getStagesTypeId(typeId = null) { //pega lista de etapas do funil
  try {
    const stages = await prisma.stage.findMany({
      where: {
        funnel_type_id: typeId/* ,
        funnel_type_id: { not: 0} */
      },
      orderBy: [{ position: "asc" }],
      select: {
        id: true,
        name: true
      }
    });
    return stages;
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

export async function getFunnelType() { //pega lista de etapas do funil
  try {
    const stages = await prisma.funnel_type.findMany({
      // where: {
      //   funnel_type_id: type/* ,
      //   funnel_type_id: { not: 0} */
      // },
      orderBy: [{ id: "asc" }],
      select: {
        id: true,
        name: true
      }
    });
    return stages;
  } catch (error) {
    console.error("Erro ao buscar funis:", error);
    return [];
  }
}