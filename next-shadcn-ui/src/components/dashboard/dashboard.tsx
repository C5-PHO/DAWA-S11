"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ProjectsPanel } from "./projects-panel";
import { TeamPanel } from "./team-panel";
import { TasksPanel } from "./tasks-panel";
import { OverviewPanel } from "./overview-panel";
import { SettingsPanel } from "./settings-panel";
import {
  initialProjects,
  initialMembers,
  initialTasks,
  initialSettings,
  simulateRequest,
  type Project,
  type Member,
  type Task,
  type Settings,
} from "@/lib/dashboard/model";

export function Dashboard() {
  const [data, setData] = useState({
    projects: initialProjects,
    members: initialMembers,
    tasks: initialTasks,
    settings: initialSettings,
  });
  const [activity, setActivity] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState("overview");
  const report = (message: string) => {
    setNotice(message);
    setActivity((current) => [message, ...current].slice(0, 6));
  };

  async function saveProject(project: Project, memberIds: string[]) {
    await simulateRequest();
    setData((current) => {
      const members = current.members.map((member) =>
        memberIds.includes(member.userId)
          ? { ...member, projectId: project.id }
          : member.projectId === project.id
            ? { ...member, projectId: "" }
            : member,
      );
      return {
        ...current,
        projects: current.projects.some((item) => item.id === project.id)
          ? current.projects.map((item) =>
              item.id === project.id ? project : item,
            )
          : [...current.projects, project],
        members,
        tasks: current.tasks.map((task) =>
          task.userId &&
          !members.some(
            (member) =>
              member.userId === task.userId &&
              member.projectId === task.projectId &&
              member.isActive,
          )
            ? { ...task, userId: "" }
            : task,
        ),
      };
    });
    report(`Proyecto «${project.name}» guardado.`);
  }
  async function deleteProject(id: string) {
    await simulateRequest();
    setData((current) => ({
      ...current,
      projects: current.projects.filter((project) => project.id !== id),
      members: current.members.map((member) =>
        member.projectId === id ? { ...member, projectId: "" } : member,
      ),
      tasks: current.tasks.filter((task) => task.projectId !== id),
    }));
    report(
      "Proyecto eliminado junto con sus tareas. Sus miembros quedaron sin proyecto.",
    );
  }
  async function saveMember(member: Member) {
    await simulateRequest();
    setData((current) => ({
      ...current,
      members: current.members.some((item) => item.userId === member.userId)
        ? current.members.map((item) =>
            item.userId === member.userId ? member : item,
          )
        : [...current.members, member],
      tasks: current.tasks.map((task) =>
        task.userId === member.userId &&
        (!member.isActive || task.projectId !== member.projectId)
          ? { ...task, userId: "" }
          : task,
      ),
    }));
    report(`Miembro «${member.name}» guardado.`);
  }
  async function deleteMember(id: string) {
    await simulateRequest();
    setData((current) => ({
      ...current,
      members: current.members.filter((member) => member.userId !== id),
      tasks: current.tasks.map((task) =>
        task.userId === id ? { ...task, userId: "" } : task,
      ),
    }));
    report("Miembro eliminado. Sus tareas quedaron sin responsable.");
  }
  async function saveTask(task: Task) {
    await simulateRequest();
    setData((current) => ({
      ...current,
      tasks: current.tasks.some((item) => item.id === task.id)
        ? current.tasks.map((item) => (item.id === task.id ? task : item))
        : [task, ...current.tasks],
    }));
    report(`Tarea «${task.description}» guardada.`);
  }
  async function deleteTask(id: string) {
    await simulateRequest();
    setData((current) => ({
      ...current,
      tasks: current.tasks.filter((task) => task.id !== id),
    }));
    report("Tarea eliminada.");
  }
  async function saveSettings(settings: Settings) {
    await simulateRequest();
    setData((current) => ({ ...current, settings }));
    report("Configuración guardada y aplicada en esta sesión.");
  }
  return (
    <div className="min-h-screen">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Image src="/project-desk.svg" alt="" width={40} height={40} priority />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-primary">
                PROJECT DESK
              </p>
              <p className="font-semibold">{data.settings.workspace}</p>
            </div>
          </div>
          <Badge variant="outline">Laboratorio 11 · DAWA</Badge>
        </div>
      </header>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Dashboard de Proyectos
          </h1>
          <p className="mt-2 text-muted-foreground">
            Un espacio para organizar proyectos, personas y tareas.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Datos de demostración en memoria. Al recargar la página se
            restablece la información inicial.
          </p>
        </div>
        {notice && (
          <Alert role="status" className="border-primary/25 bg-primary/5">
            <CheckCircle2 className="text-primary" />
            <AlertDescription>{notice}</AlertDescription>
          </Alert>
        )}
        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <div className="overflow-x-auto pb-1">
            <TabsList className="h-auto min-w-max gap-1 p-1">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="projects">Proyectos</TabsTrigger>
              <TabsTrigger value="team">Equipo</TabsTrigger>
              <TabsTrigger value="tasks">Tareas</TabsTrigger>
              <TabsTrigger value="settings">Configuración</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="overview">
            <OverviewPanel {...data} activity={activity} />
          </TabsContent>
          <TabsContent value="projects">
            <ProjectsPanel
              {...data}
              onSave={saveProject}
              onDelete={deleteProject}
            />
          </TabsContent>
          <TabsContent value="team">
            <TeamPanel {...data} onSave={saveMember} onDelete={deleteMember} />
          </TabsContent>
          <TabsContent value="tasks">
            <TasksPanel
              {...data}
              pageSize={Number(data.settings.pageSize)}
              onSave={saveTask}
              onDelete={deleteTask}
            />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsPanel settings={data.settings} onSave={saveSettings} />
          </TabsContent>
        </Tabs>
      </main>
      <footer className="mx-auto max-w-7xl px-4 pb-6 text-xs text-muted-foreground sm:px-8">
        Next.js · shadcn/ui · Gestión de proyectos
      </footer>
    </div>
  );
}
