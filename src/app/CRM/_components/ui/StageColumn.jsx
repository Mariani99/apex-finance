import { useDrop } from "react-dnd";
import { LeadCard } from "../../page";

export default function StageColumn({
  col,
  leads,
  moveLead,
  refresh,
  deleteLead,
}) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "LEAD_CARD",
    drop: async (item) => {
      if (item.prospec_funnel_id !== col.id) {
        await moveLead(item.id, col.id);
        await refresh();
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`rounded-2xl border border-slate-200 bg-[#F6F8FA] p-3 shadow-sm transition-all  ${
        isOver && canDrop ? "ring-2 ring-blue-400" : ""
      }`}
    >
      <div
        className={`mb-3 border-b-2 ${col.color} pb-2 text-sm font-semibold text-slate-600`}
      >
        {col.label}
      </div>
      <div className="space-y-3 max-h-[300px] md:max-h-[510px] overflow-y-auto custom-scrollbar">
        {(leads || []).map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onMove={async (id, stage) => {
              await moveLead(id, stage);
              await refresh();
            }}
            onDelete={async (id) => {
              await deleteLead(id);
              await refresh();
            }}
          />
        ))}
        {(!leads || leads.length === 0) && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-xs text-slate-400">
            Sem cards
          </div>
        )}
      </div>
    </div>
  );
}
