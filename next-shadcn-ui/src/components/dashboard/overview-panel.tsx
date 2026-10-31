import { FolderKanban, ListChecks, Users, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Project, type Member, type Task } from "@/lib/dashboard/model";

export function OverviewPanel({
  projects,
  members,
  tasks,
  activity,
}: {
  projects: Project[];
  members: Member[];
  tasks: Task[];
  activity: string[];
}) {
  const done = tasks.filter((task) => task.status === "Completado").length;
  const metrics = [
    {
      label: "Total de proyectos",
      value: projects.length,
      icon: FolderKanban,
      note: `${projects.filter((project) => project.status === "En progreso").length} en progreso`,
    },
    {
      label: "Tareas completadas",
      value: done,
      icon: CheckCircle2,
      note: `${tasks.length ? Math.round((done / tasks.length) * 100) : 0}% del total`,
    },
    {
      label: "Tareas pendientes",
      value: tasks.length - done,
      icon: ListChecks,
      note: `${tasks.filter((task) => !task.userId).length} sin responsable`,
    },
    {
      label: "Miembros activos",
      value: members.filter((member) => member.isActive).length,
      icon: Users,
      note: `${members.length} miembros registrados`,
    },
  ];
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, note }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p
                data-testid={label}
                className="text-3xl font-semibold tracking-tight"
              >
                {value}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">{note}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Estado del trabajo</CardTitle>
            <CardDescription>
              Resumen calculado a partir de las tareas actuales.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {["Pendiente", "En progreso", "Completado"].map((status) => {
              const count = tasks.filter(
                (task) => task.status === status,
              ).length;
              return (
                <div key={status}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>{status}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                  <div className="h-2 rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: `${tasks.length ? (count / tasks.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Actividad de esta sesión</CardTitle>
            <CardDescription>
              Últimos cambios realizados en el dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activity.length ? (
              <ul className="space-y-3 text-sm">
                {activity.map((entry, index) => (
                  <li key={index} className="border-b pb-3 last:border-0">
                    {entry}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-sm text-muted-foreground">
                Todavía no hay cambios. Crea o actualiza un registro para
                comenzar.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
