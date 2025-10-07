import React from "react";

export default function MetricCard({ icon: Icon, title, subtitle, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
          <Icon size={20} className="text-[#1E88E5]" />
        </div>
        <div className="text-sm">
          <div className="font-[16px] text-[#31333D]">{title}</div>
          <div className="text-[12px] text-[#1E88E5]">{subtitle}</div>
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div className="text-2xl font-semibold text-slate-900">{value}</div>
        <div className="h-8 w-24 rounded bg-gradient-to-tr from-emerald-100 to-emerald-200" />
      </div>
    </div>
  );
}
