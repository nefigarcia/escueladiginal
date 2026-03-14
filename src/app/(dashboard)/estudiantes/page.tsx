"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Search, 
  UserPlus, 
  MoreVertical, 
  Edit, 
  Trash2,
  FileUp,
  Loader2,
  History,
  Phone,
  Mail
} from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, useUser, setDocumentNonBlocking, updateDocumentNonBlocking, useDoc } from "@/firebase"
import { collection, doc, serverTimestamp, getDocs, query, where, limit, addDoc } from "firebase/firestore"
import Papa from "papaparse"

export default function EstudiantesPage() {
  const { firestore } = useFirestore()
  const { user } = useUser()
  const router = useRouter()
  const [mounted, setMounted] = React.useState(false)
  
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const profileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null
    return doc(firestore, "staff_roles", user.uid)
  }, [firestore, user])
  const { data: profile } = useDoc(profileRef)
  
  const studentsQuery = useMemoFirebase(() => {
    if (!firestore || !profile?.schoolId) return null;
    return query(collection(firestore, "students"), where("schoolId", "==", profile.schoolId));
  }, [firestore, profile])

  const { data: students, isLoading } = useCollection(studentsQuery)
  
  const [searchTerm, setSearchTerm] = React.useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isImporting, setIsImporting] = React.useState(false)
  const [importProgress, setImportProgress] = React.useState(0)
  
  const [newStudent, setNewStudent] = React.useState({
    firstName: "",
    lastName: "",
    studentIdNumber: "",
    gradeLevel: "1ro Primaria",
    address: "",
    guardianName: "",
    phone: "",
    email: "",
  })

  const [editingStudent, setEditingStudent] = React.useState<any>(null)

  const filteredStudents = (students || []).filter(s => 
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.studentIdNumber && s.studentIdNumber.includes(searchTerm))
  )

  const handleAddStudent = async () => {
    const { firstName, lastName, studentIdNumber } = newStudent;

    if (!firstName.trim() || !lastName.trim() || !studentIdNumber.trim() || !profile?.schoolId) {
      toast({
        variant: "destructive",
        title: "Campos incompletos",
        description: "Por favor llena los nombres y la matrícula del estudiante.",
      })
      return
    }

    if (!firestore) return

    try {
      addDocumentNonBlocking(collection(firestore, "students"), {
        schoolId: profile.schoolId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        studentIdNumber: studentIdNumber.trim(),
        gradeLevel: newStudent.gradeLevel.trim(),
        address: newStudent.address.trim(),
        guardianName: newStudent.guardianName.trim(),
        phone: newStudent.phone.trim(),
        email: newStudent.email.trim(),
        enrollmentDate: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        outstandingBalance: 0,
      })

      setIsAddDialogOpen(false)
      setNewStudent({
        firstName: "",
        lastName: "",
        studentIdNumber: "",
        gradeLevel: "1ro Primaria",
        address: "",
        guardianName: "",
        phone: "",
        email: "",
      })
      
      toast({ title: "Estudiante registrado" })
    } catch (e) {
      toast({ variant: "destructive", title: "Error" })
    }
  }

  const handleOpenEdit = (student: any) => {
    setEditingStudent(student)
    setIsEditDialogOpen(true)
  }

  const handleUpdateStudent = () => {
    if (!firestore || !editingStudent) return

    const studentDocRef = doc(firestore, "students", editingStudent.id)
    updateDocumentNonBlocking(studentDocRef, {
      ...editingStudent,
      updatedAt: serverTimestamp(),
    })

    setIsEditDialogOpen(false)
    setEditingStudent(null)
    toast({ title: "Estudiante actualizado" })
  }

  const handleDeleteStudent = (id: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, "students", id))
    toast({ title: "Estudiante eliminado" })
  }

  const getNormalizedValue = (row: any, keys: string[]) => {
    const normalizedRow = Object.keys(row).reduce((acc: any, key) => {
      const normKey = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      acc[normKey] = row[key];
      return acc;
    }, {});

    for (const key of keys) {
      const normTargetKey = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      if (normalizedRow[normTargetKey] !== undefined) return normalizedRow[normTargetKey];
    }
    return undefined;
  };

  const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  }

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !firestore || !profile?.schoolId) return

    setIsImporting(true)
    setImportProgress(0)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: async (results) => {
        const rows = results.data as any[]
        if (rows.length === 0) {
          setIsImporting(false)
          toast({ variant: "destructive", title: "Archivo vacío" })
          return
        }

        let processedCount = 0
        let successCount = 0

        for (const row of rows) {
          try {
            const matriculaRaw = getNormalizedValue(row, ["studentIdNumber", "Matricula", "ID", "Matrícula"]);
            const fName = getNormalizedValue(row, ["firstName", "Nombre"]);
            const lName = getNormalizedValue(row, ["lastName", "Apellidos"]);
            const grade = getNormalizedValue(row, ["gradeLevel", "Grado"]);
            const totalAmtRaw = getNormalizedValue(row, ["totalAmount", "totalAmount ", "Total", "Monto"]);
            const pDateRaw = getNormalizedValue(row, ["paymentDate", "Fecha"]);
            const received = getNormalizedValue(row, ["receivedFrom", "Recibido de", "Tutor"]);
            const monthStr = getNormalizedValue(row, ["month", "Mes"]);
            const emailRaw = getNormalizedValue(row, ["email", "Correo"]);
            const phoneRaw = getNormalizedValue(row, ["phone", "Telefono"]);
            
            const inscAmt = getNormalizedValue(row, ["Inscripcion", "Inscripción"]);
            const colAmt = getNormalizedValue(row, ["Colegiatura"]);

            if (!matriculaRaw) {
              processedCount++
              continue
            }

            const cleanMatricula = String(matriculaRaw).trim()
            let studentDocId = ""
            
            const sQuery = query(collection(firestore, "students"), where("studentIdNumber", "==", cleanMatricula), where("schoolId", "==", profile.schoolId), limit(1))
            const sSnap = await getDocs(sQuery)
            
            if (sSnap.empty) {
              const newDocRef = doc(collection(firestore, "students"))
              studentDocId = newDocRef.id
              await setDocumentNonBlocking(newDocRef, {
                schoolId: profile.schoolId,
                firstName: fName ? String(fName).trim() : "Alumno",
                lastName: lName ? String(lName).trim() : "Importado",
                studentIdNumber: cleanMatricula,
                gradeLevel: grade || "N/A",
                address: getNormalizedValue(row, ["address", "Direccion"]) || "N/A",
                phone: phoneRaw ? String(phoneRaw).trim() : "",
                email: emailRaw ? String(emailRaw).trim() : "",
                guardianName: received || "",
                outstandingBalance: 0,
                createdAt: serverTimestamp(),
              }, { merge: true })
            } else {
              studentDocId = sSnap.docs[0].id
            }

            const totalAmt = parseFloat(String(totalAmtRaw || "0").replace(/[^0-9.-]+/g, ""))
            if (totalAmt > 0) {
              const paymentItems: any[] = []
              if (parseFloat(String(inscAmt || "0")) > 0) {
                paymentItems.push({ id: "insc-" + Math.random().toString(36).substr(2, 5), name: "Inscripción", amount: parseFloat(String(inscAmt)), type: 'fee' })
              }
              if (parseFloat(String(colAmt || "0")) > 0) {
                paymentItems.push({ id: "col-" + Math.random().toString(36).substr(2, 5), name: "Colegiatura / Inscripción", amount: totalAmt, month: monthStr, type: 'fee' })
              }
              
              if (paymentItems.length === 0) {
                paymentItems.push({ id: "gen-" + Math.random().toString(36).substr(2, 5), name: "Pago General", amount: totalAmt, type: 'custom' })
              }

              const studentPaymentsRef = collection(firestore, "students", studentDocId, "payments")
              await addDoc(studentPaymentsRef, {
                schoolId: profile.schoolId,
                studentId: studentDocId,
                studentName: (fName && lName) ? `${fName} ${lName}` : "Alumno Importado",
                items: paymentItems,
                totalAmount: totalAmt,
                paymentDate: parseDate(String(pDateRaw)),
                paymentMethod: getNormalizedValue(row, ["paymentMethod", "Metodo"]) || "Transferencia",
                receivedFrom: received || "Administración",
                status: 'completado',
                createdAt: serverTimestamp(),
              })
            }

            successCount++
          } catch (err) {
            console.error("Error processing row:", err)
          }
          processedCount++
          setImportProgress(Math.round((processedCount / rows.length) * 100))
        }

        setIsImporting(false)
        toast({ 
          title: "Importación Finalizada", 
          description: `Se han procesado ${successCount} registros y sus historiales correctamente.` 
        })
        e.target.value = ""
      }
    })
  }

  if (!mounted) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold text-primary">Gestión de Estudiantes</h2>
          <p className="text-muted-foreground">Registro y control de la comunidad estudiantil para tu institución.</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleImportCSV} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              disabled={isImporting}
            />
            <Button variant="outline" className="gap-2" disabled={isImporting}>
              {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
              Importar CSV
            </Button>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" /> Registrar Estudiante
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Nuevo Registro Estudiantil</DialogTitle>
                <DialogDescription>Ingresa los datos básicos del alumno.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombres</Label>
                    <Input value={newStudent.firstName} onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Apellidos</Label>
                    <Input value={newStudent.lastName} onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Matrícula / ID</Label>
                    <Input value={newStudent.studentIdNumber} onChange={(e) => setNewStudent({...newStudent, studentIdNumber: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Grado</Label>
                    <Input value={newStudent.gradeLevel} onChange={(e) => setNewStudent({...newStudent, gradeLevel: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tutor</Label>
                    <Input value={newStudent.guardianName} onChange={(e) => setNewStudent({...newStudent, guardianName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input value={newStudent.phone} onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                    <Label>Correo del Tutor</Label>
                    <Input type="email" value={newStudent.email} onChange={(e) => setNewStudent({...newStudent, email: e.target.value})} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleAddStudent}>Guardar Registro</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isImporting && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4 flex items-center gap-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div className="flex-1">
              <p className="text-sm font-bold">Importando datos y pagos... {importProgress}%</p>
              <div className="w-full bg-muted h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-primary h-full transition-all duration-300" style={{ width: `${importProgress}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3 bg-muted/20 border-b">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nombre o ID..." 
                className="pl-9 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-none border-0 bg-white overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-bold">ID</TableHead>
                  <TableHead className="font-bold">Estudiante</TableHead>
                  <TableHead className="font-bold">Tutor</TableHead>
                  <TableHead className="font-bold">Grado</TableHead>
                  <TableHead className="font-bold">Estado de Cuenta</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="h-24 text-center">Cargando...</TableCell></TableRow>
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id} className="hover:bg-muted/10">
                      <TableCell className="font-medium text-primary">{student.studentIdNumber}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{student.firstName} {student.lastName}</span>
                          <span className="text-[10px] text-muted-foreground uppercase">{student.address}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-foreground">{student.guardianName || "Sin tutor"}</span>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {student.phone || "---"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {student.email || "---"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="rounded-md">{student.gradeLevel}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {(student.outstandingBalance || 0) > 0 ? (
                            <>
                              <div className="h-2 w-2 rounded-full bg-rose-500" />
                              <span className="font-bold text-rose-600">
                                ${Number(student.outstandingBalance).toLocaleString()} MXN
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="h-2 w-2 rounded-full bg-emerald-500" />
                              <span className="font-bold text-emerald-600">Al corriente</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2" onClick={() => handleOpenEdit(student)}>
                              <Edit className="h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2" onClick={() => router.push(`/pagos?studentId=${student.studentIdNumber}`)}>
                              <History className="h-4 w-4" /> Historial de Pagos
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive gap-2" onClick={() => handleDeleteStudent(student.id)}>
                              <Trash2 className="h-4 w-4" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={6} className="h-24 text-center">No hay resultados.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Estudiante</DialogTitle>
            <DialogDescription>Actualiza la información del alumno.</DialogDescription>
          </DialogHeader>
          {editingStudent && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombres</Label>
                  <Input value={editingStudent.firstName} onChange={(e) => setEditingStudent({...editingStudent, firstName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Apellidos</Label>
                  <Input value={editingStudent.lastName} onChange={(e) => setEditingStudent({...editingStudent, lastName: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Matrícula / ID</Label>
                  <Input value={editingStudent.studentIdNumber} onChange={(e) => setEditingStudent({...editingStudent, studentIdNumber: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Grado</Label>
                  <Input value={editingStudent.gradeLevel} onChange={(e) => setEditingStudent({...editingStudent, gradeLevel: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tutor</Label>
                  <Input value={editingStudent.guardianName} onChange={(e) => setEditingStudent({...editingStudent, guardianName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input value={editingStudent.phone} onChange={(e) => setEditingStudent({...editingStudent, phone: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Correo del Tutor</Label>
                <Input type="email" value={editingStudent.email} onChange={(e) => setEditingStudent({...editingStudent, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Dirección</Label>
                <Input value={editingStudent.address} onChange={(e) => setEditingStudent({...editingStudent, address: e.target.value})} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpdateStudent}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
