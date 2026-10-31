"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Choice,
  choices,
  DateField,
  DeleteDialog,
  EmptyState,
  FormError,
  SubmitButton,
  TextField,
} from "./shared";
import {
  displayDate,
  priorities,
  taskStatuses,
  type Task,
  type Project,
  type Member,
} from "@/lib/dashboard/model";

function TaskEditor({
  task,
  projects,
  members,
  onSave,
}: {
  task?: Task;
  projects: Project[];
  members: Member[];
  onSave: (task: Task) => Promise<void>;
}) {
  const empty: Task = {
    id: "",
    description: "",
    projectId: "",
    userId: "",
    status: "Pendiente",
    priority: "Media",
    dateline: "",
  };
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Task>(task ?? empty);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const update = (next: Partial<Task>) =>
    setDraft((current) => ({ ...current, ...next }));
  const eligible = members.filter(
    (member) => member.projectId === draft.projectId && member.isActive,
  );
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!busy) {
          if (next) {
            setDraft(task ?? empty);
            setError("");
          }
          setOpen(next);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant={task ? "outline" : "default"}
          size={task ? "sm" : "default"}
          disabled={!projects.length}
        >
          {task ? "Editar" : "Nueva tarea"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <form
          className="space-y-5"
          noValidate
          onSubmit={async (event) => {
            event.preventDefault();
            if (
              draft.description.trim().length < 5 ||
              !projects.some((project) => project.id === draft.projectId) ||
              !draft.dateline
            ) {
              setError(
                "Ingresa una descripción de al menos 5 caracteres, selecciona un proyecto y una fecha límite.",
              );
              return;
            }
            if (
              draft.userId &&
              !eligible.some((member) => member.userId === draft.userId)
            ) {
              setError(
                "El responsable debe ser un miembro activo del proyecto seleccionado.",
              );
              return;
            }
            setBusy(true);
            setError("");
            try {
              await onSave({
                ...draft,
                id: task?.id ?? crypto.randomUUID(),
                description: draft.description.trim(),
              });
              setOpen(false);
            } finally {
              setBusy(false);
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>{task ? "Editar tarea" : "Crear tarea"}</DialogTitle>
            <DialogDescription>
              Asigna el trabajo a un proyecto y a un miembro activo de su
              equipo.
            </DialogDescription>
          </DialogHeader>
          <FormError message={error} />
          <fieldset disabled={busy} className="space-y-4">
            <TextField
              id="task-description"
              label="Descripción de la tarea"
              value={draft.description}
              onChange={(description) => update({ description })}
              maxLength={500}
            />
            <Choice
              id="task-project"
              label="Proyecto"
              value={draft.projectId}
              onChange={(projectId) => update({ projectId, userId: "" })}
              options={projects.map((project) => ({
                value: project.id,
                label: project.name,
              }))}
            />
            <Choice
              id="task-user"
              label="Responsable"
              value={draft.userId || "none"}
              onChange={(userId) =>
                update({ userId: userId === "none" ? "" : userId })
              }
              options={[
                { value: "none", label: "Sin asignar" },
                ...eligible.map((member) => ({
                  value: member.userId,
                  label: member.name,
                })),
              ]}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Choice
                id="task-status"
                label="Estado de la tarea"
                value={draft.status}
                onChange={(status) =>
                  update({ status: status as Task["status"] })
                }
                options={choices(taskStatuses)}
              />
              <Choice
                id="task-priority"
                label="Prioridad"
                value={draft.priority}
                onChange={(priority) =>
                  update({ priority: priority as Task["priority"] })
                }
                options={choices(priorities)}
              />
            </div>
            <DateField
              id="task-dateline"
              label="Fecha límite"
              value={draft.dateline}
              onChange={(dateline) => update({ dateline })}
            />
          </fieldset>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <SubmitButton busy={busy}>
              {task ? "Guardar cambios" : "Crear tarea"}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TasksPanel({
  tasks,
  projects,
  members,
  pageSize,
  onSave,
  onDelete,
}: {
  tasks: Task[];
  projects: Project[];
  members: Member[];
  pageSize: number;
  onSave: (task: Task) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const detail = tasks.find((task) => task.id === detailId);
  const deleting = tasks.find((task) => task.id === deleteId);
  const filtered = tasks.filter(
    (task) =>
      task.description.toLowerCase().includes(query.trim().toLowerCase()) &&
      (status === "all" || task.status === status),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const navigate = (event: React.MouseEvent, next: number) => {
    event.preventDefault();
    setPage(Math.min(totalPages, Math.max(1, next)));
  };
  return (
    <div className="space-y-6">
      <div className="section-heading">
        <div>
          <h2 className="text-xl font-semibold">Tareas</h2>
          <p className="text-sm text-muted-foreground">
            Da seguimiento a los pendientes y sus responsables.
          </p>
        </div>
        <TaskEditor projects={projects} members={members} onSave={onSave} />
      </div>
      {!projects.length && (
        <EmptyState>Crea un proyecto antes de registrar tareas.</EmptyState>
      )}
      <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
        <div className="space-y-2">
          <label htmlFor="task-search" className="text-sm font-medium">
            Buscar tarea
          </label>
          <Input
            id="task-search"
            placeholder="Buscar por descripción…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <Choice
          id="task-filter"
          label="Filtrar por estado"
          value={status}
          onChange={(next) => {
            setStatus(next);
            setPage(1);
          }}
          options={[
            { value: "all", label: "Todos los estados" },
            ...choices(taskStatuses),
          ]}
        />
      </div>
      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableCaption className="pb-4">
            {filtered.length} tareas · Página {currentPage} de {totalPages}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Tarea</TableHead>
              <TableHead>Proyecto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Fecha límite</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="max-w-64 whitespace-normal font-medium">
                  {task.description}
                </TableCell>
                <TableCell>
                  {projects.find((project) => project.id === task.projectId)
                    ?.name ?? "Sin proyecto"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      task.status === "Completado" ? "default" : "secondary"
                    }
                  >
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      task.priority === "Urgente" ? "destructive" : "outline"
                    }
                  >
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  {members.find((member) => member.userId === task.userId)
                    ?.name ?? "Sin asignar"}
                </TableCell>
                <TableCell>{displayDate(task.dateline)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDetailId(task.id)}
                    >
                      Ver
                    </Button>
                    <TaskEditor
                      task={task}
                      projects={projects}
                      members={members}
                      onSave={onSave}
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteId(task.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!visible.length && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-28 text-center text-muted-foreground"
                >
                  No se encontraron tareas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination aria-label="Paginación de tareas">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              text="Anterior"
              href="#"
              aria-label="Página anterior"
              aria-disabled={currentPage === 1}
              tabIndex={currentPage === 1 ? -1 : 0}
              className={
                currentPage === 1 ? "pointer-events-none opacity-40" : ""
              }
              onClick={(event) => navigate(event, currentPage - 1)}
            />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, index) => index + 1)
            .filter(
              (number) =>
                number === 1 ||
                number === totalPages ||
                Math.abs(number - currentPage) <= 1,
            )
            .map((number) => (
              <PaginationItem key={number}>
                <PaginationLink
                  href="#"
                  aria-label={`Página ${number}`}
                  isActive={number === currentPage}
                  onClick={(event) => navigate(event, number)}
                >
                  {number}
                </PaginationLink>
              </PaginationItem>
            ))}
          <PaginationItem>
            <PaginationNext
              text="Siguiente"
              href="#"
              aria-label="Página siguiente"
              aria-disabled={currentPage === totalPages}
              tabIndex={currentPage === totalPages ? -1 : 0}
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-40"
                  : ""
              }
              onClick={(event) => navigate(event, currentPage + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <Dialog
        open={!!detail}
        onOpenChange={(next) => {
          if (!next) setDetailId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalle de tarea</DialogTitle>
            <DialogDescription>{detail?.description}</DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <p>
                Proyecto:{" "}
                {
                  projects.find((project) => project.id === detail.projectId)
                    ?.name
                }
              </p>
              <p>
                Responsable:{" "}
                {members.find((member) => member.userId === detail.userId)
                  ?.name ?? "Sin asignar"}
              </p>
              <p>
                Estado: {detail.status} · Prioridad: {detail.priority}
              </p>
              <p>Fecha límite: {displayDate(detail.dateline)}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <DeleteDialog
        open={!!deleting}
        onOpenChange={(next) => {
          if (!next) setDeleteId(null);
        }}
        title="Eliminar tarea"
        description={`Se eliminará «${deleting?.description ?? ""}». Esta acción no se puede deshacer.`}
        onConfirm={async () => {
          if (deleteId) await onDelete(deleteId);
        }}
      />
    </div>
  );
}
