"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus } from "@phosphor-icons/react";

// Função fictícia para simular o envio da coluna para o backend
const addColumnToDatabase = async (columnData) => {
  try {
    const response = await fetch("/api/columns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(columnData),
    });
    const result = await response.json();
    if (response.ok) {
      return result;
    } else {
      throw new Error(result.message || "Erro ao adicionar coluna");
    }
  } catch (error) {
    console.error("Erro ao adicionar coluna:", error);
    throw error;
  }
};

export function ColumnForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Controle do estado do dialog
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setIsError(false);

    const columnData = { name, description };

    try {
      const result = await addColumnToDatabase(columnData);
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
          <div className="mb-4">
            <Label htmlFor="description">Descrição</Label>
            <Input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="mt-1"
            />
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
