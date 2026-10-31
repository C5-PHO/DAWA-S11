"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
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
  localDate,
  validEmail,
  type Member,
  type Project,
  type Task,
} from "@/lib/dashboard/model";

function MemberEditor({
  member,
  members,
  projects,
  onSave,
}: {
  member?: Member;
  members: Member[];
  projects: Project[];
  onSave: (member: Member) => Promise<void>;
}) {
  const empty: Member = {
    userId: "",
    name: "",
    email: "",
    role: "Colaborador",
    position: "",
    birthdate: "",
    phone: "",
    projectId: "",
    isActive: true,
  };
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Member>(member ?? empty);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const update = (next: Partial<Member>) =>
    setDraft((current) => ({ ...current, ...next }));
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!busy) {
          if (next) {
            setDraft(member ?? empty);
            setError("");
          }
          setOpen(next);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant={member ? "outline" : "default"}
          size={member ? "sm" : "default"}
        >
          {member ? "Editar" : "Nuevo miembro"}
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
              draft.position.trim().length < 2
            ) {
              setError("Ingresa el nombre completo y el cargo del miembro.");
              return;
            }
            if (!validEmail(draft.email.trim())) {
              setError("Ingresa un correo electrónico válido.");
              return;
            }
            if (
              members.some(
                (item) =>
                  item.userId !== member?.userId &&
                  item.email.toLowerCase() === draft.email.trim().toLowerCase(),
              )
            ) {
              setError("Ya existe un miembro con ese correo electrónico.");
              return;
            }
            if (!/^\+?[\d\s()-]{7,20}$/.test(draft.phone.trim())) {
              setError(
                "Ingresa un teléfono válido de entre 7 y 20 caracteres.",
              );
              return;
            }
            if (!draft.birthdate || draft.birthdate >= localDate(new Date())) {
              setError("Selecciona una fecha de nacimiento anterior a hoy.");
              return;
            }
            setError("");
            setBusy(true);
            try {
              await onSave({
                ...draft,
                userId: member?.userId ?? crypto.randomUUID(),
                name: draft.name.trim(),
                email: draft.email.trim().toLowerCase(),
                position: draft.position.trim(),
                phone: draft.phone.trim(),
              });
              setOpen(false);
            } finally {
              setBusy(false);
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {member ? "Editar miembro" : "Crear miembro"}
            </DialogTitle>
            <DialogDescription>
              Registra los datos de contacto, su función y el proyecto asignado.
            </DialogDescription>
          </DialogHeader>
          <FormError message={error} />
          <fieldset disabled={busy} className="space-y-4">
            <TextField
              id="member-name"
              label="Nombre completo"
              value={draft.name}
              onChange={(name) => update({ name })}
            />
            <TextField
              id="member-email"
              label="Correo electrónico"
              type="email"
              value={draft.email}
              onChange={(email) => update({ email })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Choice
                id="member-role"
                label="Rol"
                value={draft.role}
                options={choices(["Administrador", "Líder", "Colaborador"])}
                onChange={(role) => update({ role })}
              />
              <TextField
                id="member-position"
                label="Cargo"
                value={draft.position}
                onChange={(position) => update({ position })}
              />
              <DateField
                id="member-birthdate"
                label="Fecha de nacimiento"
                value={draft.birthdate}
                birthdate
                onChange={(birthdate) => update({ birthdate })}
              />
              <TextField
                id="member-phone"
                label="Teléfono"
                type="tel"
                value={draft.phone}
                onChange={(phone) => update({ phone })}
              />
            </div>
            <Choice
              id="member-project"
              label="Proyecto asignado"
              value={draft.projectId || "none"}
              onChange={(projectId) =>
                update({ projectId: projectId === "none" ? "" : projectId })
              }
              options={[
                { value: "none", label: "Sin proyecto" },
                ...projects.map((project) => ({
                  value: project.id,
                  label: project.name,
                })),
              ]}
            />
            <div className="flex items-center gap-3">
              <Switch
                id="member-active"
                checked={draft.isActive}
                onCheckedChange={(isActive) => update({ isActive })}
              />
              <Label htmlFor="member-active">Miembro activo</Label>
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
              {member ? "Guardar cambios" : "Crear miembro"}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TeamPanel({
  members,
  projects,
  tasks,
  onSave,
  onDelete,
}: {
  members: Member[];
  projects: Project[];
  tasks: Task[];
  onSave: (member: Member) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const deleting = members.find((member) => member.userId === deleteId);
  const detail = members.find((member) => member.userId === detailId);
  return (
    <div className="space-y-6">
      <div className="section-heading">
        <div>
          <h2 className="text-xl font-semibold">Equipo</h2>
          <p className="text-sm text-muted-foreground">
            {members.filter((member) => member.isActive).length} miembros
            activos de {members.length} registrados.
          </p>
        </div>
        <MemberEditor members={members} projects={projects} onSave={onSave} />
      </div>
      {!members.length && <EmptyState>No hay miembros registrados.</EmptyState>}
      <div className="grid gap-4 lg:grid-cols-2">
        {members.map((member) => (
          <Card key={member.userId}>
            <CardContent className="space-y-4 pt-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="break-words font-semibold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {member.position} · {member.role}
                  </p>
                  <p className="break-all text-sm text-muted-foreground">
                    {member.email}
                  </p>
                </div>
                <Badge variant={member.isActive ? "default" : "secondary"}>
                  {member.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {projects.find((project) => project.id === member.projectId)
                  ?.name ?? "Sin proyecto"}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDetailId(member.userId)}
                >
                  Ver miembro
                </Button>
                <MemberEditor
                  member={member}
                  members={members}
                  projects={projects}
                  onSave={onSave}
                />
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setDeleteId(member.userId)}
                >
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog
        open={!!detail}
        onOpenChange={(next) => {
          if (!next) setDetailId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{detail?.name}</DialogTitle>
            <DialogDescription>
              Información del miembro del equipo.
            </DialogDescription>
          </DialogHeader>
          {detail && (
            <dl className="grid gap-3 text-sm">
              {[
                ["ID", detail.userId],
                ["Rol", detail.role],
                ["Cargo", detail.position],
                ["Correo", detail.email],
                ["Teléfono", detail.phone],
                ["Nacimiento", displayDate(detail.birthdate)],
                [
                  "Proyecto",
                  projects.find((project) => project.id === detail.projectId)
                    ?.name ?? "Sin proyecto",
                ],
                ["Estado", detail.isActive ? "Activo" : "Inactivo"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="grid gap-1 sm:grid-cols-[100px_1fr]"
                >
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="break-all">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </DialogContent>
      </Dialog>
      <DeleteDialog
        open={!!deleting}
        onOpenChange={(next) => {
          if (!next) setDeleteId(null);
        }}
        title="Eliminar miembro"
        description={`Se eliminará a ${deleting?.name ?? ""}. Sus ${tasks.filter((task) => task.userId === deleteId).length} tareas quedarán sin responsable.`}
        onConfirm={async () => {
          if (deleteId) await onDelete(deleteId);
        }}
      />
    </div>
  );
}
