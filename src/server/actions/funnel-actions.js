"use server";

import { PrismaClient, Stage } from "@prisma/client";

const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;

export async function get_stages(funneltype = null) {
    try {
        const prospec_funnels = await prisma.stage.findMany({
            where: {
                id: { not: 0 }, //ignora coluna de exluidos/arquivados
                funnel_type_id: funneltype
            },
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

export async function createColumn(data) {
    try {
        const stageData = {
            name: data.name,
            funnel_type_id: parseInt(data.funnelTypeId, 10)
        };
        console.log(stageData);
        result = await prisma.stage.create({
            data: stageData,
        });
        return stageData;
    } catch (error) {
        console.error("Erro ao buscar funis:", error);
        return [];
    }
};

export async function deleteColumn(id) {
  try {
    const result = await prisma.stage.delete({
      where: { id: id }
    });
    return result;
  } catch (error) {
    console.error("Erro ao deletar coluna:", error);
    throw error;
  }
}