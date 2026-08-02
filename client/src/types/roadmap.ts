export type Pillar =
  | "Google"
  | "Redes Sociais"
  | "GoHighLevel"
  | "Make.com"
  | "Ferramentas Complementares";

export type Status = "A Fazer" | "Em Andamento" | "Concluído" | "Atrasado";

export type Priority = "Baixa" | "Média" | "Alta" | "Crítica";

export interface Task {
  id: number;
  userId: number;
  phaseId?: number | null;
  title: string;
  description?: string | null;
  pillar: Pillar;
  assignee?: string | null;
  startDate: Date | string;
  dueDate: Date | string;
  status: Status;
  priority: Priority;
  progress: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Phase {
  id: number;
  userId: number;
  title: string;
  pillar: Pillar;
  description?: string | null;
  startDate: Date | string;
  endDate: Date | string;
  color: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
