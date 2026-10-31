export type ProjectStatus = "Planificado" | "En progreso" | "Completado";
export type TaskStatus = "Pendiente" | "En progreso" | "Completado";
export type Priority = "Baja" | "Media" | "Alta" | "Urgente";

export interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: Priority;
  status: ProjectStatus;
}
export interface Member {
  userId: string;
  role: string;
  name: string;
  email: string;
  position: string;
  birthdate: string;
  phone: string;
  projectId: string;
  isActive: boolean;
}
export interface Task {
  id: string;
  description: string;
  projectId: string;
  status: TaskStatus;
  priority: Priority;
  userId: string;
  dateline: string;
}
export interface Settings {
  workspace: string;
  contactEmail: string;
  notifications: boolean;
  weeklyReport: boolean;
  pageSize: string;
}

export const priorities: Priority[] = ["Baja", "Media", "Alta", "Urgente"];
export const taskStatuses: TaskStatus[] = ["Pendiente", "En progreso", "Completado"];
export const projectStatuses: ProjectStatus[] = ["Planificado", "En progreso", "Completado"];
export const categories = ["Desarrollo Web", "Desarrollo Mobile", "Diseño", "Marketing", "Otro"];

export const initialProjects: Project[] = [
  { id: "p1", name: "E-commerce Platform", description: "Tienda virtual con Next.js", category: "Desarrollo Web", priority: "Alta", status: "En progreso" },
  { id: "p2", name: "Mobile App", description: "Aplicación móvil para clientes", category: "Desarrollo Mobile", priority: "Media", status: "Planificado" },
  { id: "p3", name: "API Gateway", description: "Servicios de integración", category: "Desarrollo Web", priority: "Alta", status: "Completado" },
];
export const initialMembers: Member[] = [
  { userId: "u1", role: "Colaborador", name: "María García", email: "maria@example.com", position: "Frontend Developer", birthdate: "1998-05-12", phone: "900111222", projectId: "p1", isActive: true },
  { userId: "u2", role: "Colaborador", name: "Juan Pérez", email: "juan@example.com", position: "Backend Developer", birthdate: "1997-08-20", phone: "900222333", projectId: "p1", isActive: true },
  { userId: "u3", role: "Líder", name: "Ana López", email: "ana@example.com", position: "UI/UX Designer", birthdate: "1999-02-15", phone: "900333444", projectId: "p2", isActive: true },
  { userId: "u4", role: "Líder", name: "Carlos Ruiz", email: "carlos@example.com", position: "DevOps Engineer", birthdate: "1996-11-08", phone: "900444555", projectId: "p3", isActive: true },
  { userId: "u5", role: "Administrador", name: "Laura Martínez", email: "laura@example.com", position: "Project Manager", birthdate: "1995-07-18", phone: "900555666", projectId: "", isActive: false },
];
export const initialTasks: Task[] = [
  { id: "t1", description: "Implementar autenticación", projectId: "p1", status: "En progreso", priority: "Alta", userId: "u1", dateline: "2026-11-15" },
  { id: "t2", description: "Diseñar pantalla de perfil", projectId: "p2", status: "Pendiente", priority: "Media", userId: "u3", dateline: "2026-11-20" },
  { id: "t3", description: "Configurar CI/CD", projectId: "p3", status: "Completado", priority: "Alta", userId: "u4", dateline: "2026-11-10" },
  { id: "t4", description: "Optimizar consultas SQL", projectId: "p1", status: "En progreso", priority: "Urgente", userId: "u2", dateline: "2026-11-12" },
  { id: "t5", description: "Documentar API", projectId: "p3", status: "Completado", priority: "Baja", userId: "u4", dateline: "2026-11-25" },
  { id: "t6", description: "Revisar accesibilidad", projectId: "p2", status: "Pendiente", priority: "Media", userId: "u3", dateline: "2026-12-01" },
];
export const initialSettings: Settings = { workspace: "Equipo DAWA", contactEmail: "equipo@example.com", notifications: true, weeklyReport: false, pageSize: "5" };

// Simulación explícita: los cambios viven solamente en memoria.
export const simulateRequest = () => new Promise<void>((resolve) => setTimeout(resolve, 650));
export const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const localDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const parseDate = (value: string) => new Date(`${value}T12:00:00`);
export const displayDate = (value: string) => value ? parseDate(value).toLocaleDateString("es-PE") : "Sin fecha";
