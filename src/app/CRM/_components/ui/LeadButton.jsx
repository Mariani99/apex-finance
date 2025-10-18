"use client";

import React from "react";
import {
  Dialog,
  DialogClose
} from "@/components/ui/dialog";
// import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { createLead } from "@/server/actions/lead-actions";
import { useFormStatus } from "react-dom";
import { LeadForm } from "./LeadForm";
import { ColumnForm } from "./ColumnForm.jsx";
// import { OpportunityForm } from "./OpportunityForm";

/* export function SubmitButtons() { //SEM UTILIZACAO. COMENTADO E NAO REMOVIDO POIS NAO SABEMOS COMO SERÁ NO FUTURO
  const { pending } = useFormStatus();
  return (
    <>
      <DialogClose asChild>
        <Button type="button" variant="outline" disabled={pending}>
          Cancelar
        </Button>
      </DialogClose>
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar"}
      </Button>
    </>
  );
} */

export default function LeadButton({ windowTitle, data = null }) { //lead button também servirá para o botão de nova oportunidade
console.log(data);
  let content;

  if (windowTitle === "Novo Lead" || windowTitle === "Editar Lead") { //
    content = <LeadForm title={windowTitle} data={data} />;
  } else if (windowTitle === "Nova Etapa") {
    content = <ColumnForm title={windowTitle} data={data} />;
  }

  return <Dialog>{content}</Dialog>;
}