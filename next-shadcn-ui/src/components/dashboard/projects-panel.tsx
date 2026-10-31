"use client";

import { useState } from "react";
import { ProjectEditor } from "./project-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DeleteDialog, EmptyState } from "./shared";
import { type Project, type Member, type Task } from "@/lib/dashboard/model";

export function ProjectsPanel({
  projects,
  members,
  tasks,
  onSave,
  onDelete,
}: {
  projects: Project[];
  members: Member[];
  tasks: Task[];
  onSave: (project: Project, memberIds: string[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const detail = projects.find((project) => project.id === detailId);
  const deleting = projects.find((project) => project.id === deleteId);
  return (
    <div className="space-y-6">
      <div className="section-heading">
        <div>
          <h2 className="text-xl font-semibold">Proyectos</h2>
          <p className="text-sm text-muted-foreground">
            Organiza el trabajo y las personas de cada iniciativa.
          </p>
        </div>
        <ProjectEditor members={members} onSave={onSave} />
      </div>
      {!projects.length && (
        <EmptyState>
          No hay proyectos. Crea el primero para comenzar.
        </EmptyState>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => {
          const projectTasks = tasks.filter(
            (task) => task.projectId === project.id,
          );
          const progress = projectTasks.length
            ? Math.round(
                (projectTasks.filter((task) => task.status === "Completado")
                  .length /
                  projectTasks.length) *
                  100,
              )
            : 0;
          const team = members.filter(
            (member) => member.projectId === project.id,
          );
          return (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="break-words text-lg">
                    {project.name}
                  </CardTitle>
                  <Badge
                    variant={
                      project.status === "Completado" ? "default" : "secondary"
                    }
                  >
                    {project.status}
                  </Badge>
                </div>
                <CardDescription>
                  {project.category} · Prioridad{" "}
                  {project.priority.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="break-words text-sm text-muted-foreground">
                  {project.description}
                </p>
                <div>
                  <div className="mb-2 flex justify-between text-xs">
                    <span>Tareas completadas</span>
                    <span>{progress}%</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={`Progreso de ${project.name}`}
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="h-2 overflow-hidden rounded-full bg-secondary"
                  >
                    <div
                      className="h-full bg-primary transition-[width] motion-reduce:transition-none"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {team.length} miembros · {projectTasks.length} tareas
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDetailId(project.id)}
                  >
                    Ver detalles
                  </Button>
                  <ProjectEditor
                    project={project}
                    members={members}
                    onSave={onSave}
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteId(project.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Dialog
        open={!!detail}
        onOpenChange={(open) => {
          if (!open) setDetailId(null);
        }}
      >
        <DialogContent className="max-h-[85dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detail?.name}</DialogTitle>
            <DialogDescription>{detail?.description}</DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <p className="text-sm">
                {detail.category} · {detail.status} · Prioridad{" "}
                {detail.priority}
              </p>
              <div>
                <h3 className="mb-2 font-medium">Miembros asignados</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {members
                    .filter((member) => member.projectId === detail.id)
                    .map((member) => (
                      <li key={member.userId}>
                        {member.name} — {member.position}
                      </li>
                    ))}
                </ul>
                {!members.some((member) => member.projectId === detail.id) && (
                  <p className="text-sm text-muted-foreground">
                    Sin miembros asignados.
                  </p>
                )}
              </div>
              <div>
                <h3 className="mb-2 font-medium">Tareas del proyecto</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {tasks
                    .filter((task) => task.projectId === detail.id)
                    .map((task) => (
                      <li key={task.id}>
                        {task.description} — {task.status}
                      </li>
                    ))}
                </ul>
                {!tasks.some((task) => task.projectId === detail.id) && (
                  <p className="text-sm text-muted-foreground">
                    Sin tareas registradas.
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <DeleteDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Eliminar proyecto"
        description={`Se eliminará «${deleting?.name ?? ""}» y sus ${tasks.filter((task) => task.projectId === deleteId).length} tareas. Los miembros quedarán sin proyecto. Esta acción no se puede deshacer.`}
        onConfirm={async () => {
          if (deleteId) await onDelete(deleteId);
        }}
      />
    </div>
  );
}
