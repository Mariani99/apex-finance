import { useDrop } from "react-dnd";
import { LeadCard } from "../../page";
import { X, Trash } from "@phosphor-icons/react";
import { deleteColumn } from "@/server/actions/funnel-actions";


export default function StageColumn({
  col,
  leads,
  moveLead,
  refresh,
  deleteLead
}) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "LEAD_CARD",
    drop: async (item) => {
      if (item.stage_id !== col.id) {
        await moveLead(item.id, col.id);
        await refresh();
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const handleDeleteColumn = async (id) => {
    if (confirm("Tem certeza que deseja excluir esta coluna?")) {
      try {
        await deleteColumn(id);
        await refresh(); // Atualiza o estado para refletir a exclusão
      } catch (error) {
        alert("Erro ao excluir a coluna: " + error.message);
      }
    }
  };

  return (
    <div
      ref={drop}
      className={`rounded-2xl border border-slate-200 bg-[#F6F8FA] p-3 shadow-sm transition-all  ${isOver && canDrop ? "ring-2 ring-blue-400" : ""
        }`}
    >
      <div className={`mb-3 border-b-2 ${col.color} pb-2 text-sm font-semibold text-slate-600 flex items-center justify-between`}>
        <span>{col.name}</span>
        <button
          onClick={() => handleDeleteColumn(col.id)}
          className="text-red-500 hover:text-red-700"
          title="Excluir coluna"
        >
          <X size={16} weight="bold" />
        </button>
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
