"use server";

import { PrismaClient, Stage } from "@prisma/client";
// import { Nuosu_SIL } from "next/font/google";

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
    orderBy: [{ stage_id: "asc" }, { createdAt: "desc" }],
    include: { owner: { select: { id: true, name: true, email: true } } },
  });
  return leads.map(serializeLead); //Retorna dados serializado, estava dando erro ao carregar a página
}

/**
 * createLead pode receber:
 * - um objeto JS com os campos
 * - ou um FormData direto do <form action={createLead}>
 */
export async function createLead(payload) {
  const data =
    payload instanceof FormData
      ? Object.fromEntries(payload.entries())
      : payload ?? {};

  // console.log("Dados recebidos:", data);

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
    stage_id: toInt(data.stageId),
    opportunityTitle: opt(data.opportunityTitle),
    estimatedValue: toDecimal(data.estimatedValue),
    probability: toInt(data.probability),
    expectedDate: data.expectedDate ? new Date(data.expectedDate) : null,
    paymentCondition: opt(data.paymentCondition),
    costCenter: opt(data.costCenter),
  };

  const ownerId = toInt(data.ownerId);
  if (ownerId) {
    leadData.owner = {
      connect: { id: ownerId },
    };
  }

  const id = toInt(data.id);

  let result;

  if (id) {
    result = await prisma.lead.update({
      where: { id },
      data: leadData,
    });
  } else {
    result = await prisma.lead.create({
      data: leadData,
    });
  }

  return { ok: true, leadData };
}

function serializeLead(lead) {
  return {
    id: lead.id,
    name: lead.name,
    origin: lead.origin,
    company: lead.company,
    email: lead.email,
    jobTitle: lead.jobTitle,
    notes: lead.notes,
    phone: lead.phone,
    paymentCondition: lead.paymentCondition,
    opportunityTitle: lead.opportunityTitle,
    costCenter: lead.costCenter,
    ownerId: lead.ownerId,
    stage_id: lead.stage_id,
    score: lead.score,
    probability: lead.probability,
    value: lead.value?.toNumber?.() ?? null,            // <- Decimal convert
    estimatedValue: lead.estimatedValue?.toNumber?.() ?? null,  // <- Decimal convert
    expectedDate: lead.expectedDate ? lead.expectedDate.toISOString() : null, // Date convert
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  };
}



export async function moveLead(leadId, nextFunnelId) {
  const lead = await prisma.lead.update({
    where: { id: Number(leadId) },
    data: { stage_id: Number(nextFunnelId) },
  });
  return serializeLead(lead);
}

export async function deleteLead(leadId) {
  const lead = await prisma.lead.update({
    where: { id: Number(leadId) },
    data: { stage_id: 0 },
  });
  return serializeLead(lead);
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