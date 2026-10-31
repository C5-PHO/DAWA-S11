"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Choice, choices, FormError, SubmitButton, TextField } from "./shared";
import {
  categories,
  priorities,
  projectStatuses,
  type Project,
  type Member,
} from "@/lib/dashboard/model";

export function ProjectEditor({
  project,
  members,
  onSave,
}: {
  project?: Project;
  members: Member[];
  onSave: (project: Project, memberIds: string[]) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Project>(
    project ?? {
      id: "",
      name: "",
      description: "",
      category: "",
      priority: "Media",
      status: "Planificado",
    },
  );
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const update = (next: Partial<Project>) =>
    setDraft((current) => ({ ...current, ...next }));
  function reset() {
    setDraft(
      project ?? {
        id: "",
        name: "",
        description: "",
        category: "",
        priority: "Media",
        status: "Planificado",
      },
    );
    setMemberIds(
      project
        ? members
            .filter((member) => member.projectId === project.id)
            .map((member) => member.userId)
        : [],
    );
    setError("");
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!busy) {
          if (next) reset();
          setOpen(next);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant={project ? "outline" : "default"}
          size={project ? "sm" : "default"}
        >
          {project ? "Editar" : "Nuevo Proyecto"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <form
          className="space-y-5"
          noValidate
          onSubmit={async (event) => {
            event.preventDefault();
            if (
              draft.name.trim().length < 3 ||
              draft.description.trim().length < 5 ||
              !draft.category
            ) {
              setError(
                "Ingresa un nombre de al menos 3 caracteres, una descripción de al menos 5 y una categoría.",
              );
              return;
            }
            setError("");
            setBusy(true);
            try {
              await onSave(
                {
                  ...draft,
                  id: project?.id ?? crypto.randomUUID(),
                  name: draft.name.trim(),
                  description: draft.description.trim(),
                },
                memberIds,
              );
              setOpen(false);
            } finally {
              setBusy(false);
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {project ? "Editar proyecto" : "Crear proyecto"}
            </DialogTitle>
            <DialogDescription>
              Completa los datos y selecciona sus miembros. Los cambios se
              guardan en memoria.
            </DialogDescription>
          </DialogHeader>
          <FormError message={error} />
          <fieldset disabled={busy} className="space-y-4">
            <TextField
              id="project-name"
              label="Nombre del proyecto"
              value={draft.name}
              onChange={(name) => update({ name })}
            />
            <TextField
              id="project-description"
              label="Descripción"
              value={draft.description}
              onChange={(description) => update({ description })}
              maxLength={500}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Choice
                id="project-category"
                label="Categoría"
                value={draft.category}
                onChange={(category) => update({ category })}
                options={choices(categories)}
              />
              <Choice
                id="project-priority"
                label="Prioridad"
                value={draft.priority}
                onChange={(priority) =>
                  update({ priority: priority as Project["priority"] })
                }
                options={choices(priorities)}
              />
            </div>
            <Choice
              id="project-status"
              label="Estado del proyecto"
              value={draft.status}
              onChange={(status) =>
                update({ status: status as Project["status"] })
              }
              options={choices(projectStatuses)}
            />
            <div className="space-y-3">
              <p className="text-sm font-medium">Miembros del equipo</p>
              <p className="text-xs text-muted-foreground">
                Cada miembro pertenece a un proyecto. Seleccionarlo aquí lo
                reasigna.
              </p>
              <div className="max-h-40 space-y-3 overflow-y-auto rounded-lg border p-3">
                {members.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Crea miembros en Equipo para asignarlos.
                  </p>
                )}
                {members.map((member) => (
                  <div key={member.userId} className="flex items-center gap-2">
                    <Checkbox
                      id={`project-member-${member.userId}`}
                      checked={memberIds.includes(member.userId)}
                      onCheckedChange={(checked) =>
                        setMemberIds((current) =>
                          checked
                            ? [...current, member.userId]
                            : current.filter((id) => id !== member.userId),
                        )
                      }
                    />
                    <Label htmlFor={`project-member-${member.userId}`}>
                      {member.name}
                      {!member.isActive && " (inactivo)"}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
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
              {project ? "Guardar cambios" : "Crear proyecto"}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
