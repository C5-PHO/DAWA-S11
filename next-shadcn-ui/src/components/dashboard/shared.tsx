"use client";

import { useState } from "react";
import { CalendarDays, TriangleAlert } from "lucide-react";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { displayDate, localDate, parseDate } from "@/lib/dashboard/model";

export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return <Alert variant="destructive"><TriangleAlert /><AlertTitle>Revisa los datos</AlertTitle><AlertDescription>{message}</AlertDescription></Alert>;
}

export function TextField({ id, label, value, onChange, type = "text", maxLength = 160 }: { id: string; label: string; value: string; onChange: (value: string) => void; type?: string; maxLength?: number }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Input id={id} type={type} value={value} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} /></div>;
}

export function Choice({ id, label, value, onChange, options, disabled = false }: { id: string; label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[]; disabled?: boolean }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Select value={value} onValueChange={onChange} disabled={disabled}><SelectTrigger id={id} className="w-full"><SelectValue placeholder="Selecciona una opción" /></SelectTrigger><SelectContent>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></div>;
}
export const choices = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

export function DateField({ id, label, value, onChange, birthdate = false }: { id: string; label: string; value: string; onChange: (value: string) => void; birthdate?: boolean }) {
  const [open, setOpen] = useState(false);
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Button id={id} variant="outline" className="w-full justify-between font-normal"><span>{value ? displayDate(value) : "Seleccionar fecha"}</span><CalendarDays className="size-4" /></Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" locale={es} captionLayout="dropdown" selected={value ? parseDate(value) : undefined} defaultMonth={value ? parseDate(value) : undefined} startMonth={birthdate ? new Date(1920, 0) : new Date(2020, 0)} endMonth={birthdate ? new Date() : new Date(2040, 11)} disabled={birthdate ? { after: new Date() } : undefined} onSelect={(date) => { if (date) { onChange(localDate(date)); setOpen(false); } }} /></PopoverContent></Popover></div>;
}

export function SubmitButton({ busy, children }: { busy: boolean; children: React.ReactNode }) {
  return <Button type="submit" disabled={busy}>{busy && <Spinner data-testid="saving-spinner" />}{busy ? "Guardando…" : children}</Button>;
}

export function DeleteDialog({ open, onOpenChange, title, description, onConfirm }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description: string; onConfirm: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  return <AlertDialog open={open} onOpenChange={(next) => { if (!busy) onOpenChange(next); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription>{description}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel><Button variant="destructive" disabled={busy} onClick={async () => { setBusy(true); try { await onConfirm(); onOpenChange(false); } finally { setBusy(false); } }}>{busy && <Spinner />}{busy ? "Eliminando…" : "Confirmar eliminación"}</Button></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">{children}</div>;
}
