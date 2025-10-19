"use client";

import { createLead } from "@/server/actions/lead-actions";
import { getUsers } from "@/server/actions/user-actions";
import { getFunnelType, getStagesTypeId } from "@/server/actions/funnel-actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus } from "@phosphor-icons/react";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DotsThree } from "@phosphor-icons/react";
// import { useFormStatus } from "react-dom";
// import { SubmitButtons } from "./LeadButton"; nao esta utilizando
import { useState, useTransition, useEffect } from "react";

export function LeadForm({ title, data = null }) {
  console.log(data);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [users, setUsers] = useState([]);
  const [prospecStages, setProspecStages] = useState([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState(data?.ownerId ?? ""); //esta linha garante que nao seja necessario abrir o card pelo menos uma vez para mostrar a opcao de vendedor já selecionada de acordo com o que está no banco de dados
  const [selectedStageId, setSelectedStageId] = useState(data?.stage_id ?? ""); //esta linha garante que nao seja necessario abrir o card pelo menos uma vez para mostrar a opcao de funis já selecionada de acordo com o que está no banco de dados

  const [funnelTypes, setFunnelTypes] = useState([]); // Para armazenar os tipos de funil
  const [selectedFunnelTypeId, setSelectedFunnelTypeId] = useState(""); // Para armazenar o tipo de funil selecionado
  const [stagesByFunnel, setStagesByFunnel] = useState({}); // Para armazenar as etapas de funil agrupadas por tipo de funil
  const [availableStages, setAvailableStages] = useState([]); // Para armazenar as etapas disponíveis baseadas no tipo de funil selecionado

  useEffect(() => { //busca as informações para colocar no select/options ao invés de campos fixos
    const loadUsers = async () => { //carrega a lista de usuários para colocar na seleção do campo do form
      try {
        const usersList = await getUsers();
        setUsers(usersList);
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
      }
    };

    const loadFunnelTypes = async () => {  // Nova função para carregar os tipos de funil
      try {
        const funnelList = await getFunnelType(); // Carrega os tipos de funil
        console.log(funnelList); // Verifique se está retornando corretamente
        setFunnelTypes(funnelList); // Armazena os tipos de funil
        return funnelList;
      } catch (error) {
        console.error("Erro ao carregar tipos de funil:", error);
        return [];
      }
    };

    const loadProspecStages = async () => { //carrega a lista de etapas do funil para colocar na seleção do campo do form
      try {
        const stagesList = await getFunnelType(); // Chama a função para carregar as etapas
        console.log(stagesList);
        setProspecStages(stagesList); // Armazena as etapas

      } catch (error) {
        console.error("Erro ao carregar etapas de prospecção:", error);
      }
    };

    if (isOpen) {
      const doLoad = async () => {
        // carregar usuários
        await loadUsers();

        // carregar tipos de funil e, para cada tipo, carregar suas etapas
        const funnels = await loadFunnelTypes();
        const funnelStages = {};
        for (const f of funnels) {
          try {
            const stages = await getStagesTypeId(f.id);
            funnelStages[f.id] = stages || [];
          } catch (e) {
            funnelStages[f.id] = [];
          }
        }
        setStagesByFunnel(funnelStages);

        // Se estivermos editando um lead (data) pré-selecionar o funnel e etapa
        if (data && data.stage_id) {
          // Encontrar qual funnel contém a etapa
          const found = Object.keys(funnelStages).find((fid) =>
            funnelStages[fid].some((s) => Number(s.id) === Number(data.stage_id))
          );
          if (found) {
            setSelectedFunnelTypeId(String(found));
            setAvailableStages(funnelStages[found] || []);
            setSelectedStageId(String(data.stage_id));
          }
        }

        // ainda mantém compatibilidade com prospecStages
        await loadProspecStages();
      };

      doLoad();
    }
  }, [isOpen]);

  // Quando o usuário seleciona um tipo de funil, buscar as etapas daquele funil
  useEffect(() => {
    if (!selectedFunnelTypeId) {
      setAvailableStages([]);
      return;
    }

    let mounted = true;
    const fetchStages = async () => {
      try {
        const stages = await getStagesTypeId(Number(selectedFunnelTypeId));
        if (mounted) setAvailableStages(stages || []);
      } catch (error) {
        console.error("Erro ao carregar etapas do funil selecionado:", error);
        if (mounted) setAvailableStages([]);
      }
    };

    fetchStages();
    return () => (mounted = false);
  }, [selectedFunnelTypeId]);

  useEffect(() => {
    if (data) {
      setSelectedOwnerId(data.ownerId ?? ""); //seleciona o campo do formulario já na primeira abertura
      setSelectedStageId(data.stage_id ?? ""); //seleciona o campo do formulario já na primeira abertura
    }
  }, [data, users, prospecStages]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    startTransition(async () => {
      try {
        console.log("Enviando formData:", Object.fromEntries(formData));
        const result = await createLead(formData);
        console.log("Resultado da createLead:", result);

        if (result && result.ok) {
          setMessage("Lead criado com sucesso!");
          setIsError(false);
          // Limpar o formulário
          event.target.reset();
          // Fechar o dialog após 2 segundos
          setTimeout(() => {
            setIsOpen(false);
            setMessage("");
          }, 1000);
        }
      } catch (error) {
        console.error("Erro completo:", error);
        setMessage(`Erro inesperado ao criar lead: ${error.message}`);
        setIsError(true);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {title === "Novo Lead" ? ( //Dependendo do title, a imagem mudará, pois aproveitaremos //
          //o component tanto para atualizar quanto para adicionar lead //
          <Button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Novo Lead
            <Plus size={16} weight="bold" />
          </Button>
        ) : title === "Editar Lead" ? (
          <DotsThree className="cursor-pointer">
            {title} <Plus size={16} weight="bold" />
          </DotsThree>
        ) : null}
      </DialogTrigger>

      <DialogContent className=" sm:w-[90%] h-auto max-h-[90vh] overflow-visible">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Preencha os dados do novo lead.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <div className="grid grid-cols-2 gap-4">
                {title !== "Novo Lead" && (
                  <div className="grid gap-2">
                    <Label htmlFor="id-1">ID</Label>
                    <Input
                      id="id-1"
                      name="id"
                      required
                      defaultValue={data?.id ?? ""}
                      readOnly
                    />
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="name-1">Nome</Label>
                  <Input
                    id="name-1"
                    name="name"
                    required
                    defaultValue={data && data.name !== null ? data.name : ""}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="company-1">Empresa</Label>
                  <Input
                    id="company-1"
                    name="company"
                    defaultValue={
                      data && data.company !== null ? data.company : ""
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email-1">Email</Label>
                  <Input
                    id="email-1"
                    name="email"
                    type="email"
                    defaultValue={data && data.email !== null ? data.email : ""}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone-1">Telefone</Label>
                  <Input
                    id="phone-1"
                    name="phone"
                    defaultValue={data && data.phone !== null ? data.phone : ""}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="jobTitle-1">Cargo</Label>
                  <Input
                    id="jobTitle-1"
                    name="jobTitle"
                    defaultValue={
                      data && data.jobTitle !== null ? data.jobTitle : ""
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="origin-1">Origem</Label>
                  <Input
                    id="origin-1"
                    name="origin"
                    placeholder="Site, Anúncio, Indicação..."
                    defaultValue={data && data.origin !== null ? data.origin : ""}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="score-1">Score</Label>
                  <Input
                    id="score-1"
                    name="score"
                    type="number"
                    min={0}
                    max={100}
                    defaultValue={data && data.score !== null ? data.score : ""}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ownerId-1">Vendedor Responsável</Label>
                  <Select
                    id="ownerId-1"
                    name="ownerId"
                    value={selectedOwnerId}
                    onChange={(e) => setSelectedOwnerId(e.target.value)}
                  >
                    <option value="">Selecione um vendedor (opcional)</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stage-1">Tipo de funil</Label>
                  <Select
                    id="stage-1"
                    name="funnelTypeId"
                    value={selectedFunnelTypeId}
                    onChange={(e) => {
                      setSelectedFunnelTypeId(e.target.value); // Atualize o tipo de funil selecionado
                      setAvailableStages(stagesByFunnel[e.target.value] || []); // Carregue as etapas desse tipo de funil
                    }}
                    required
                  >
                    <option value="">Selecione um tipo de funil</option>
                    {funnelTypes.map((funnel) => (
                      <option key={funnel.id} value={funnel.id}>
                        {funnel.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="stageId">Etapa do funil</Label>
                  <Select
                    id="stageId"
                    name="stageId"
                    value={selectedStageId}
                    onChange={(e) => setSelectedStageId(e.target.value)}
                    required
                  >
                    <option value="">Selecione uma etapa</option>
                    {availableStages.map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="opportunityTitle">Título da Oportunidade</Label>
                  <Input
                    id="opportunityTitle"
                    name="opportunityTitle"
                    defaultValue={data?.opportunityTitle ?? ""}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="estimatedValue">Valor Estimado (R$)</Label>
                  <Input
                    id="estimatedValue"
                    name="estimatedValue"
                    type="number"
                    min={0}
                    step="0.01"
                    defaultValue={data?.estimatedValue ?? 0}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="probability">Probabilidade (%)</Label>
                  <Input
                    id="probability"
                    name="probability"
                    type="number"
                    min={1}
                    max={100}
                    defaultValue={data?.probability ?? ""}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="expectedDate">Data Prevista</Label>
                  <Input
                    id="expectedDate"
                    name="expectedDate"
                    type="date"
                    defaultValue={data?.expectedDate ?? ""}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="paymentCondition">Condição de Pagamento</Label>
                  <Input
                    id="paymentCondition"
                    name="paymentCondition"
                    defaultValue={data?.paymentCondition ?? ""}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="costCenter">Centro de Custo</Label>
                  <Select
                    id="costCenter"
                    name="costCenter"
                    defaultValue={data?.costCenter ?? ""}
                    required
                  >
                    <option value="">Selecione um centro de custo</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Administrativo">Administrativo</option>
                    <option value="Vendas">Vendas</option>
                    <option value="Operações">Operações</option>
                  </Select>
                </div>
                <div className="md:col-span-2 flex flex-col gap-2">
                  <Label htmlFor="notes-1">Observações</Label>
                  <textarea
                    id="notes-1"
                    name="notes"
                    className="flex min-h-[80px] max-h-[30vh] w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background resize-y"
                    defaultValue={data && data.notes !== null ? data.notes : ""}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-5 gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog >
  );
}
