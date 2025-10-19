"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { getFunnelType, createColumn } from "@/server/actions/funnel-actions";

// Função fictícia para simular o envio da coluna para o backend


export function ColumnForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Controle do estado do dialog
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [selectedFunnelTypeId, setSelectedFunnelTypeId] = useState(""); // Para armazenar o tipo de funil selecionado
  const [funnelTypes, setFunnelTypes] = useState([]); // Para armazenar os tipos de funil
  useEffect(() => {
    const loadFunnelTypes = async () => {  // Nova função para carregar os tipos de funil
      try {
        const funnelList = await getFunnelType(); // Carrega os tipos de funil
        setFunnelTypes(funnelList); // Armazena os tipos de funil
        return funnelList;
      } catch (error) {
        console.error("Erro ao carregar tipos de funil:", error);
        return [];
      }
    };
    loadFunnelTypes();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setIsError(false);

    const columnData = { name, funnelTypeId: selectedFunnelTypeId, };

    try {
      const result = await createColumn(columnData);
      setMessage("Coluna adicionada com sucesso!");
      setIsError(false);
      setName(""); // Limpa os campos
      setDescription("");
      setIsOpen(false); // Fecha o dialog
    } catch (error) {
      setMessage("Erro ao adicionar coluna: " + error.message);
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Nova etapa
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Nova Coluna</DialogTitle>
          <DialogDescription>Preencha os campos abaixo para adicionar uma nova coluna ao banco de dados.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {/* Nome */}
          <div className="mb-4">
            <Label htmlFor="name">Nome da Coluna</Label>
            <Input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          {/* Descrição */}
          <div className="grid gap-2">
            <Label htmlFor="stage-1">Tipo de funil</Label>
            <Select
              id="stage-1"
              name="funnelTypeId"
              value={selectedFunnelTypeId}
              onChange={(e) => {
                setSelectedFunnelTypeId(e.target.value); // Atualize o tipo de funil selecionado
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

          {/* Mensagem de Status */}
          {message && (
            <div className={`p-2 my-4 text-sm ${isError ? 'text-red-500' : 'text-green-500'}`}>
              {message}
            </div>
          )}

          <DialogFooter>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              {isSubmitting ? "Enviando..." : "Adicionar Coluna"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
