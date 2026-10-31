"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Choice, choices, FormError, SubmitButton, TextField } from "./shared";
import { validEmail, type Settings } from "@/lib/dashboard/model";

export function SettingsPanel({
  settings,
  onSave,
}: {
  settings: Settings;
  onSave: (settings: Settings) => Promise<void>;
}) {
  const [draft, setDraft] = useState(settings);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const update = (next: Partial<Settings>) =>
    setDraft((current) => ({ ...current, ...next }));
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Configuración del espacio</CardTitle>
        <CardDescription>
          Simula las preferencias del equipo. El nombre del espacio y el tamaño
          de página se aplican al guardar; los avisos no envían correos reales.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-5"
          noValidate
          onSubmit={async (event) => {
            event.preventDefault();
            if (
              draft.workspace.trim().length < 3 ||
              !validEmail(draft.contactEmail.trim())
            ) {
              setError(
                "Ingresa un nombre de al menos 3 caracteres y un correo de contacto válido.",
              );
              return;
            }
            setBusy(true);
            setError("");
            try {
              await onSave({
                ...draft,
                workspace: draft.workspace.trim(),
                contactEmail: draft.contactEmail.trim(),
              });
            } finally {
              setBusy(false);
            }
          }}
        >
          <FormError message={error} />
          <fieldset disabled={busy} className="space-y-5">
            <TextField
              id="settings-workspace"
              label="Nombre del espacio"
              value={draft.workspace}
              onChange={(workspace) => update({ workspace })}
            />
            <TextField
              id="settings-email"
              label="Correo de contacto"
              type="email"
              value={draft.contactEmail}
              onChange={(contactEmail) => update({ contactEmail })}
            />
            <Choice
              id="settings-page-size"
              label="Tareas por página"
              value={draft.pageSize}
              options={choices(["3", "5", "10"])}
              onChange={(pageSize) => update({ pageSize })}
            />
            <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
              <Label htmlFor="settings-notifications">
                Simular notificaciones de actividad
              </Label>
              <Switch
                id="settings-notifications"
                checked={draft.notifications}
                onCheckedChange={(notifications) => update({ notifications })}
              />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
              <Label htmlFor="settings-weekly">Simular resumen semanal</Label>
              <Switch
                id="settings-weekly"
                checked={draft.weeklyReport}
                onCheckedChange={(weeklyReport) => update({ weeklyReport })}
              />
            </div>
          </fieldset>
          <SubmitButton busy={busy}>Guardar configuración</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
