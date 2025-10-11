"use client";

import MetricCard from "./_components/ui/MetricCard";
import { useEffect, useMemo, useState } from "react";
import { useDrag } from "react-dnd";
import { useDrop } from "react-dnd";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  listLeads,
  createLead,
  moveLead,
  deleteLead,
  get_prospecFunnels,
} from "../../server/actions/lead-actions";

import LeadButton from "./_components/ui/LeadButton";

import {
  MagnifyingGlass,
  ChartLineUp,
  Wallet,
  EnvelopeSimple,
  WhatsappLogo,
  CalendarBlank,
  Funnel,
  Plus,
  DotsThree,
  CaretDown,
} from "@phosphor-icons/react";
import Client from "./_components/ui/Client";
import StageColumn from "./_components/ui/StageColumn";

/* const STAGES = [
  { key: "LEAD", label: "Lead Capturado", color: "border-blue-500" },
  { key: "MQL", label: "MQL", color: "border-amber-400" },
  { key: "ANALISE_MQL", label: "Análise de MQL", color: "border-emerald-500" },
  { key: "SQL", label: "SQL", color: "border-red-500" },
  { key: "REUNIAO", label: "Reunião agendada", color: "border-yellow-400" },
]; */

export function LeadCard({ lead, onDelete }) {
  const [{ isDragging }, drag] = useDrag({
    type: "LEAD_CARD",
    item: () => ({
      id: lead.id,
      prospec_funnel_id: lead.prospec_funnel_id, // ✅ chave que será comparada no drop
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm${
        isDragging ? " opacity-50" : ""
      }`}
      style={{ cursor: "move" }}
    >
      <div className=" mb-2 flex items-start justify-between">
        <div className="font-medium text-[15px] text-slate-800">
          {(() => {
            const parts = lead.name.trim().split(" ");
            return parts.length > 1
              ? lead.id + ". " + `${parts[0]} ${parts[parts.length - 1]}`
              : lead.id + ". " + parts[0];
          })()}
        </div>

        <LeadButton windowTitle="Editar Lead" data={lead} />
        {/* </button> */}
      </div>

      <div className="mb-3 text-xs text-slate-500">
        {new Date(lead.updatedAt).getDate() +
          " deVERIFICAR ESSE CAMPO!!! " +
          new Date(lead.updatedAt)
            .toLocaleDateString("pt-BR", { month: "long" })
            .replace(/^./, (str) => str.toUpperCase())}
      </div>

      <div className="flex items-center gap-2">
        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 hover:bg-slate-50"
          title="Agendar"
        >
          <CalendarBlank size={18} className="text-[#1E88E5]  " />
        </button>
        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 hover:bg-slate-50"
          title="Email"
        >
          <EnvelopeSimple size={18} className="text-[#1E88E5]" />
        </button>
        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 hover:bg-slate-50"
          title="WhatsApp"
          onClick={() => window.open("https://wa.me/" + lead.phone, "_blank")}
        >
          <WhatsappLogo size={18} className="text-[#1E88E5]" />
        </button>
      </div>

      {/* ações rápidas: mover ou deletar */}
      <div className="mt-3 flex flex-wrap gap-2">
        {/* {STAGES.filter((s) => s.key !== lead.stage).map((s) => (
          <button
            key={s.key}
            onClick={() => onMove(lead.id, s.key)}
            className="text-xs text-blue-600 hover:underline"
          >
            → {s.label}
          </button>
        ))} */}
        <button
          onClick={() => onDelete(lead.id)}
          className="text-xs text-red-500 hover:underline"
        >
          Excluir
        </button>
      </div>
    </div>
  );
}
export default function CRMPage() {
  const [leads, setLeads] = useState([]);
  const [userName, setUserName] = useState("");
  const [search, setSearch] = useState("");
  const [funnels, setFunnels] = useState([]);
  const [selectedFunnel, setSelectedFunnel] = useState("prospec"); // Estado para controlar a aba de prospecção e expansão

  async function refresh() {
    const data = await listLeads();
    setLeads(data);
  }

  useEffect(() => {
    async function fetchData() {
      const [leadsData, funnelData] = await Promise.all([
        listLeads(),
        get_prospecFunnels(),
      ]);

      setLeads(leadsData);
      setFunnels(funnelData);

      try {
        const name = localStorage.getItem("userName");
        if (name) setUserName(name);
      } catch (e) {}
    }
    fetchData();
  }, []);

  const grouped = useMemo(() => {
    const by = Object.fromEntries(funnels.map((f) => [f.id, []]));
    leads
      .filter((l) =>
        search
          ? l.name.toLowerCase().includes(search.toLowerCase()) ||
            (l.origin || "").toLowerCase().includes(search.toLowerCase())
          : true
      )
      .forEach((l) => {
        if (by[l.prospec_funnel_id]) {
          by[l.prospec_funnel_id].push(l);
        }
      });
    return by;
  }, [leads, search, funnels]);

  const handleFunnelSelection = (funnelType) => {
    setSelectedFunnel(funnelType);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-[#F7F8FA] text-slate-900">
        <div className="mx-auto grid max-w-[1400px] grid-cols-[260px_1fr] gap-6 px-4 py-6">
          <aside className="h-[calc(100vh-48px)] sticky top-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-6 px-2 text-2xl font-extrabold tracking-tight text-[#2A6CF6]">
              Nex <span className="text-slate-800">Tools</span>
            </div>

            <div className="relative mb-5">
              <MagnifyingGlass
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar…"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:bg-white"
              />
            </div>

            <nav className="space-y-1 text-sm">
              {["Dashboard", "CRM"].map((item, idx) => (
                <a
                  key={item}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                    item === "CRM"
                      ? "bg-blue-50 font-medium text-blue-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                  href="#"
                >
                  <span className="truncate">{item}</span>
                  {item === "CRM" && (
                    <span className="ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-600 px-2 text-xs font-semibold text-white">
                      {leads.length}
                    </span>
                  )}
                </a>
              ))}

              <div className="mt-6 text-xs font-semibold uppercase text-slate-400">
                Configurações
              </div>
              {["Editor DRE/KPIs", "Usuários"].map((i) => (
                <a
                  key={i}
                  className="mt-1 block rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-50"
                  href="#"
                >
                  {i}
                </a>
              ))}
            </nav>

            <Client nome={userName} />
          </aside>

          <main className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-[22px] font-semibold">
                  CRM & Pipeline de Vendas
                </h1>
                <p className="text-sm text-slate-500">
                  Gestão completa de leads, oportunidades e funil de vendas
                </p>
              </div>
              <div className="flex items-center gap-2">
                <LeadButton windowTitle="Nova Oportunidade" />
                <LeadButton windowTitle="Novo Lead" />
              </div>
            </div>

            {/* Métricas */}
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                icon={ChartLineUp}
                title="Pipeline Ponderado"
                subtitle="Valor x Probabilidade"
                value="R$ 142.000"
              />
              <MetricCard
                icon={Wallet}
                title="Pipeline Total"
                subtitle="Valor total das oportunidades"
                value="R$ 250K"
              />
              <MetricCard
                icon={Wallet}
                title="Ticket médio"
                subtitle="Valor médio por oportunidade"
                value="R$ 83K"
              />
              <MetricCard
                icon={Funnel}
                title="Oportunidades ativas"
                subtitle="Em negociação"
                value="03"
              />
            </section>
            <div className="space-y-6 h-[655px]">
              <section className="h-[70px] flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm ">
                {[
                  { label: "Todos os vendedores" },
                  { label: "Todas as origens" },
                  { label: "Últimos 30 dias" },
                ].map((f) => (
                  <button
                    key={f.label}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    {f.label} <CaretDown size={14} />
                  </button>
                ))}

                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() => handleFunnelSelection("prospec")}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      selectedFunnel === "prospec"
                        ? "bg-blue-600 text-white"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    Funil de Prospecção
                  </button>
                  <button
                    onClick={() => handleFunnelSelection("expansion")}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      selectedFunnel === "expansion"
                        ? "bg-blue-600 text-white"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    Funil de Expansão
                  </button>
                </div>
              </section>
              <section>
                {selectedFunnel === "prospec" ? (
                  <div
                    className="grid gap-4"
                    style={{
                      gridTemplateColumns: `repeat(${funnels.length}, minmax(0, 1fr))`,
                    }}
                  >
                    {funnels.length > 0 ? (
                      funnels.map((col) => (
                        <StageColumn
                          key={col.id}
                          col={col}
                          leads={grouped[col.id] || []}
                          moveLead={moveLead}
                          refresh={refresh}
                          deleteLead={deleteLead}
                        />
                      ))
                    ) : (
                      <p>Carregando colunas...</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <h2>Funil de expansão</h2>
                    {leads.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {leads.map((lead) => (
                          <LeadCard key={lead.id} lead={lead} onDelete={deleteLead} />
                        ))}
                      </div>
                    ) : (
                      <p>Carregando leads...</p>
                    )}
                  </div>
                )}
              </section>
            </div>
          </main>
        </div>
      </div>
    </DndProvider>
  );
}
