"use server";

import { PrismaClient, Stage } from "@prisma/client";

// --- Prisma singleton (evita muitas conexões em dev/hmr) ---
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;

// -------- Helpers de parse/normalização --------
function opt(v) {
  const s = String(v ?? "").trim();
  return s ? s : null;
}
function toInt(v) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}
function toDecimal(v) {
  if (v === null || v === undefined || v === "") return null;
  const s = String(v).replace(",", ".").trim();
  const n = Number(s);
  return Number.isFinite(n) ? String(n) : null;
}
function stageOrDefault(v) {
  const s = String(v || "").toUpperCase();
  return Object.prototype.hasOwnProperty.call(Stage, s) ? Stage[s] : Stage.LEAD;
}

// ----------------- Ações -----------------
export async function listLeads() {
  const leads = await prisma.lead.findMany({
    orderBy: [{ prospec_funnel_id: "asc" }, { createdAt: "desc" }],
    include: { owner: { select: { id: true, name: true, email: true } } },
  });
  return leads.map(serializeLead); //Retorna dados serializado, estava dando erro ao carregar a página
}

/**
 * createLead pode receber:
 * - um objeto JS com os campos
 * - ou um FormData direto do <form action={createLead}>
 */
export async function createLead(payload) { //Esta função não está servindo apenas para criar, mas também ATUALIZAR o lead
  // Transforma FormData ou objeto simples em objeto plano
  const data =
    payload instanceof FormData
      ? Object.fromEntries(payload.entries())
      : payload ?? {};

  console.log("Dados recebidos:", data);

const leadData = {
    name: String(data.name || "").trim(),
    company: opt(data.company),
    email: opt(data.email?.toLowerCase()),
    phone: opt(data.phone),
    jobTitle: opt(data.jobTitle),
    origin: opt(data.origin),
    score: toInt(data.score),
    notes: opt(data.notes),
    value: toDecimal(data.value),
    ownerId: toInt(data.ownerId),
    prospec_funnel_id: toInt(data.stageId),
    stage: stageOrDefault(data.stage), // Default: LEAD
  };

  const id = toInt(data.id); // pode vir como string do formulário

  let result;

  if (id) {
    // Faz UPDATE se o ID for válido
    result = await prisma.lead.update({
      where: { id },
      data: leadData,
    });
    // console.log("Lead atualizado:", result);
    } else {
    // Faz CREATE se não houver ID
      result = await prisma.lead.create({ data: leadData });
      // console.log("Lead criado:", result);
    }
  return { ok: true, leadData };
}

function serializeLead(lead) {
  //Serializa os dados que estavam dando erro ao carregar a página
  return {
    id: lead.id,
    name: lead.name,
    company: lead.company,
    email: lead.email,
    phone: lead.phone,
    jobTitle: lead.jobTitle,
    origin: lead.origin,
    score: lead.score,
    notes: lead.notes,
    value: lead.value?.toNumber?.() ?? null,
    ownerId: lead.ownerId,
    stage: lead.stage,
    prospec_funnel_id: lead.prospec_funnel_id,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  };
}

export async function moveLead(leadId, nextFunnelId) {
  return prisma.lead.update({
    where: { id: Number(leadId) },
    data: { prospec_funnel_id: Number(nextFunnelId) },
  });
}

export async function deleteLead(leadId) {
  return prisma.lead.update({
    where: { id: Number(leadId) },
    data: { prospec_funnel_id: 0 },
  });
}

export async function updateLead(leadId, partial = {}) {
  const data = {};

  if (partial.name !== undefined) data.name = String(partial.name).trim();
  if (partial.company !== undefined) data.company = opt(partial.company);
  if (partial.email !== undefined)
    data.email = opt(String(partial.email).toLowerCase());
  if (partial.phone !== undefined) data.phone = opt(partial.phone);
  if (partial.jobTitle !== undefined) data.jobTitle = opt(partial.jobTitle);
  if (partial.origin !== undefined) data.origin = opt(partial.origin);
  if (partial.score !== undefined) data.score = toInt(partial.score);
  if (partial.notes !== undefined) data.notes = opt(partial.notes);
  if (partial.value !== undefined) data.value = toDecimal(partial.value);
  if (partial.ownerId !== undefined) data.ownerId = toInt(partial.ownerId);
  if (partial.stage !== undefined) data.stage = stageOrDefault(partial.stage);

  return prisma.lead.update({
    where: { id: Number(leadId) },
    data,
  });
}

export async function get_prospecFunnels() {
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