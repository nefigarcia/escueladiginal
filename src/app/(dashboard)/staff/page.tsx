"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Shield, ShieldCheck, ShieldAlert, UserPlus, MoreHorizontal } from "lucide-react"

const staff = [
  { name: "Roberto García", role: "Director", level: "Admin", status: "Activo" },
  { name: "María López", role: "Contadora", level: "Finanzas", status: "Activo" },
  { name: "Juan Pérez", role: "Secretario", level: "Secretaría", status: "En Línea" },
  { name: "Ana Sosa", role: "Prefecta", level: "Académico", status: "Ausente" },
]

export default function StaffPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold text-primary">Gestión de Personal</h2>
          <p className="text-muted-foreground">Control de acceso y roles para el personal escolar.</p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" /> Invitar Personal
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Roles Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Permisos configurados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Accesos Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-xs text-emerald-500 font-medium">Sin incidentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Alertas de Seguridad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Intentos fallidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Personal Activo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">De 10 registrados</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Directorio de Accesos</CardTitle>
          <CardDescription>Administra quién puede ver la información financiera y académica.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {staff.map((person) => (
              <div key={person.name} className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={`https://picsum.photos/seed/${person.name}/40/40`} />
                    <AvatarFallback>{person.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold">{person.name}</p>
                    <p className="text-xs text-muted-foreground">{person.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-xs text-muted-foreground mb-1 uppercase tracking-tighter">Nivel de Acceso</span>
                    <Badge variant="outline" className="gap-1">
                      {person.level === "Admin" ? <ShieldCheck className="h-3 w-3" /> : person.level === "Finanzas" ? <Shield className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                      {person.level}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={person.status === "Activo" || person.status === "En Línea" ? "bg-emerald-500" : "bg-amber-500"}>
                      {person.status}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}