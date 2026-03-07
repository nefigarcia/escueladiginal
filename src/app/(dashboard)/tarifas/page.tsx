"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Settings2, Trash2, Edit2, Wallet } from "lucide-react"
import { MOCK_FEES } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"

export default function TarifasPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold text-primary">Configuración de Tarifas</h2>
          <p className="text-muted-foreground">Define los montos y conceptos de cobro escolar.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Nueva Tarifa
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_FEES.map((fee) => (
          <Card key={fee.id} className="relative group overflow-hidden border-l-4 border-l-primary hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge className="mb-2 capitalize" variant="outline">{fee.type}</Badge>
                <Wallet className="h-5 w-5 text-muted-foreground/50" />
              </div>
              <CardTitle className="font-headline text-xl">{fee.name}</CardTitle>
              <CardDescription>Costo estándar por ciclo escolar 2024-2025.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                ${fee.amount.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">MXN</span>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 pt-4 flex justify-end gap-2">
              <Button variant="ghost" size="sm" className="h-8 gap-1">
                <Edit2 className="h-3 w-3" /> Editar
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-destructive hover:text-destructive gap-1">
                <Trash2 className="h-3 w-3" /> Eliminar
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        <button className="flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-lg p-12 text-muted-foreground hover:border-primary hover:text-primary transition-all group">
          <Settings2 className="h-12 w-12 mb-4 group-hover:rotate-45 transition-transform" />
          <span className="font-medium">Personalizar Catálogo</span>
          <p className="text-xs mt-2 text-center">Añade categorías personalizadas para eventos especiales o cooperativas.</p>
        </button>
      </div>
    </div>
  )
}