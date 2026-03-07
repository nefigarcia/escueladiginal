export interface Student {
  id: string;
  idNumber: string;
  name: string;
  curp: string;
  grade: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  outstandingBalance: number;
}

export interface Fee {
  id: string;
  name: string;
  amount: number;
  type: 'mensualidad' | 'inscripcion' | 'materiales' | 'otros';
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  studentName: string;
  feeName: string;
  amount: number;
  date: string;
  status: 'completado' | 'pendiente';
}

export interface ClassSchedule {
  id: string;
  subject: string;
  teacher: string;
  room: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
  color: string;
}

export const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    idNumber: '2024001',
    name: 'Sofia García López',
    curp: 'GALS010101HDFRRA01',
    grade: '1º A',
    guardianName: 'Roberto García',
    guardianPhone: '55 1234 5678',
    guardianEmail: 'roberto@email.com',
    outstandingBalance: 1200,
  },
  {
    id: '2',
    idNumber: '2024002',
    name: 'Mateo Hernández Ruiz',
    curp: 'HERM020202HDFRRA02',
    grade: '2º B',
    guardianName: 'Lucía Ruiz',
    guardianPhone: '55 8765 4321',
    guardianEmail: 'lucia@email.com',
    outstandingBalance: 0,
  },
  {
    id: '3',
    idNumber: '2024003',
    name: 'Valentina Martínez Sosa',
    curp: 'MARV030303HDFRRA03',
    grade: '3º A',
    guardianName: 'Andrea Sosa',
    guardianPhone: '55 4567 8901',
    guardianEmail: 'andrea@email.com',
    outstandingBalance: 3500,
  },
  {
    id: '4',
    idNumber: '2024004',
    name: 'Santiago Pérez Gómez',
    curp: 'PEGS040404HDFRRA04',
    grade: '1º B',
    guardianName: 'Jorge Pérez',
    guardianPhone: '55 9012 3456',
    guardianEmail: 'jorge@email.com',
    outstandingBalance: 500,
  },
];

export const MOCK_FEES: Fee[] = [
  { id: 'f1', name: 'Mensualidad Enero', amount: 3500, type: 'mensualidad' },
  { id: 'f2', name: 'Inscripción Anual', amount: 5000, type: 'inscripcion' },
  { id: 'f3', name: 'Paquete de Libros', amount: 1200, type: 'materiales' },
  { id: 'f4', name: 'Taller de Robótica', amount: 800, type: 'otros' },
];

export const MOCK_PAYMENTS: PaymentRecord[] = [
  {
    id: 'p1',
    studentId: '1',
    studentName: 'Sofia García López',
    feeName: 'Inscripción Anual',
    amount: 5000,
    date: '2024-01-10',
    status: 'completado',
  },
  {
    id: 'p2',
    studentId: '2',
    studentName: 'Mateo Hernández Ruiz',
    feeName: 'Mensualidad Enero',
    amount: 3500,
    date: '2024-01-05',
    status: 'completado',
  },
  {
    id: 'p3',
    studentId: '3',
    studentName: 'Valentina Martínez Sosa',
    feeName: 'Mensualidad Enero',
    amount: 3500,
    date: '2024-01-02',
    status: 'pendiente',
  },
];

export const MOCK_SCHEDULES: ClassSchedule[] = [
  {
    id: 's1',
    subject: 'Matemáticas',
    teacher: 'Prof. Martínez',
    room: 'Aula 101',
    startTime: '08:00',
    endTime: '09:30',
    dayOfWeek: 'Lunes',
    color: 'bg-blue-100 border-blue-400 text-blue-700',
  },
  {
    id: 's2',
    subject: 'Lenguaje y Comunicación',
    teacher: 'Profa. Sánchez',
    room: 'Aula 102',
    startTime: '09:30',
    endTime: '11:00',
    dayOfWeek: 'Lunes',
    color: 'bg-emerald-100 border-emerald-400 text-emerald-700',
  },
  {
    id: 's3',
    subject: 'Ciencias Naturales',
    teacher: 'Prof. Gómez',
    room: 'Laboratorio A',
    startTime: '11:30',
    endTime: '13:00',
    dayOfWeek: 'Martes',
    color: 'bg-amber-100 border-amber-400 text-amber-700',
  },
  {
    id: 's4',
    subject: 'Historia de México',
    teacher: 'Profa. Díaz',
    room: 'Aula 201',
    startTime: '08:00',
    endTime: '09:30',
    dayOfWeek: 'Miércoles',
    color: 'bg-purple-100 border-purple-400 text-purple-700',
  },
  {
    id: 's5',
    subject: 'Educación Física',
    teacher: 'Prof. Ruiz',
    room: 'Patio Central',
    startTime: '10:00',
    endTime: '11:30',
    dayOfWeek: 'Jueves',
    color: 'bg-orange-100 border-orange-400 text-orange-700',
  },
];
