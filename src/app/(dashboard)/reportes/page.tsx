"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  CartesianGrid 
} from "recharts"
import { Download, Printer, Filter, Calendar } from "lucide-react"

const financialData = [
  { mes: "Ene", cobrado: 120000, pendiente: 35000 },
  { mes: "Feb", cobrado: 135000, pendiente: 28000 },
  { mes: "Mar", cobrado: 142000, pendiente: 15000 },
  { mes: "Abr", cobrado: 128000, pendiente: 42000 },
  { mes: "May", cobrado: 150000, pendiente: 10000 },
]

export default function ReportesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold text-primary">Reportes Administrativos</h2>
          <p className="text-muted-foreground">Información financiera y operativa consolidada.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" /> Filtros
          </Button>
          <Button className="gap-2">
            <Download className="h-4 w-4" /> Descargar Todo
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline">Flujo de Cobranza</CardTitle>
              <CardDescription>Comparativa mensual de pagos realizados vs. pendientes.</CardDescription>
            </div>
            <BarChart className="h-8 w-8 text-primary opacity-20" />
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialData}>
                  <XAxis dataKey="mes" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip />
                  <Bar dataKey="cobrado" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Cobrado" />
                  <Bar dataKey="pendiente" fill="hsl(var(--destructive) / 0.5)" radius={[4, 4, 0, 0]} name="Pendiente" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline">Crecimiento de Ingresos</CardTitle>
              <CardDescription>Tendencia histórica de recaudación neta.</CardDescription>
            </div>
            <LineChart className="h-8 w-8 text-accent opacity-20" />
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={financialData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip />
                  <Line type="monotone" dataKey="cobrado" stroke="hsl(var(--accent))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="font-headline">Resumen Operativo Mensual</CardTitle>
          <CardDescription>Métricas clave de rendimiento escolar.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="p-6 rounded-xl bg-muted/30 border text-center">
              <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider">Eficiencia de Cobro</p>
              <p className="text-4xl font-bold text-primary">94.2%</p>
              <p className="text-xs text-emerald-500 mt-2 font-medium">+1.2% vs mes anterior</p>
            </div>
            <div className="p-6 rounded-xl bg-muted/30 border text-center">
              <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider">Ingreso Promedio x Alumno</p>
              <p className="text-4xl font-bold text-primary">$4,850</p>
              <p className="text-xs text-muted-foreground mt-2 font-medium">Establecido en MXN</p>
            </div>
            <div className="p-6 rounded-xl bg-muted/30 border text-center">
              <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider">Morosidad Crítica</p>
              <p className="text-4xl font-bold text-destructive">3.5%</p>
              <p className="text-xs text-rose-500 mt-2 font-medium">-0.8% mejora constante</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}