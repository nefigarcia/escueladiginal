'use server';
/**
 * @fileOverview Un agente de IA para redactar comunicaciones a padres de familia.
 *
 * - smartParentCommunicationsDrafting - Una función que maneja el proceso de redacción de comunicaciones inteligentes para padres.
 * - SmartParentCommunicationsDraftingInput - El tipo de entrada para la función smartParentCommunicationsDrafting.
 * - SmartParentCommunicationsDraftingOutput - El tipo de retorno para la función smartParentCommunicationsDrafting.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SmartParentCommunicationsDraftingInputSchema = z.object({
  templateName: z.enum(['recordatorioDePago', 'avisoDeEvento', 'avisoGeneral']).describe('El nombre de la plantilla de comunicación a utilizar. Puede ser "recordatorioDePago", "avisoDeEvento" o "avisoGeneral".'),
  contextData: z.object({
    studentId: z.string().optional().describe('El número de identificación del estudiante.'),
    studentName: z.string().optional().describe('El nombre completo del estudiante.'),
    guardianName: z.string().optional().nullable().describe('El nombre del tutor o padre del estudiante.'),
    outstandingBalance: z.number().optional().describe('El saldo pendiente del estudiante (solo para recordatorios de pago).'),
    dueDate: z.string().optional().describe('La fecha límite para el pago o el evento (en formato YYYY-MM-DD).'),
    eventName: z.string().optional().describe('El nombre del evento (solo para avisos de eventos).'),
    eventDate: z.string().optional().describe('La fecha del evento (en formato YYYY-MM-DD).'),
    eventTime: z.string().optional().describe('La hora del evento.'),
    eventLocation: z.string().optional().describe('La ubicación del evento.'),
    schoolName: z.string().optional().default('Escuela Digital MX').describe('El nombre de la escuela.'),
    schoolContactEmail: z.string().email().optional().default('contacto@escueladigitalmx.edu').describe('El correo electrónico de contacto de la escuela.'),
    schoolContactPhone: z.string().optional().default('+52 55 1234 5678').describe('El número de teléfono de contacto de la escuela.'),
    additionalDetails: z.string().optional().describe('Detalles adicionales personalizados para incluir en el mensaje.'),
  }).default({
    schoolName: 'Escuela Digital MX',
    schoolContactEmail: 'contacto@escueladigitalmx.edu',
    schoolContactPhone: '+52 55 1234 5678',
  }).describe('Datos contextuales relevantes para la comunicación, como información del estudiante, detalles del pago o del evento.'),
});
export type SmartParentCommunicationsDraftingInput = z.infer<typeof SmartParentCommunicationsDraftingInputSchema>;

const SmartParentCommunicationsDraftingOutputSchema = z.object({
  draftMessage: z.string().describe('El borrador generado del mensaje de comunicación listo para ser enviado.'),
});
export type SmartParentCommunicationsDraftingOutput = z.infer<typeof SmartParentCommunicationsDraftingOutputSchema>;

export async function smartParentCommunicationsDrafting(input: SmartParentCommunicationsDraftingInput): Promise<SmartParentCommunicationsDraftingOutput> {
  return smartParentCommunicationsDraftingFlow(input);
}

const smartParentCommunicationsDraftingPrompt = ai.definePrompt({
  name: 'smartParentCommunicationsDraftingPrompt',
  input: { schema: SmartParentCommunicationsDraftingInputSchema },
  output: { schema: SmartParentCommunicationsDraftingOutputSchema },
  system: `Eres un asistente amigable y profesional para la administración escolar. Tu tarea es redactar comunicaciones claras y concisas para los padres de familia, en español, basándote en la plantilla seleccionada y los datos proporcionados. El tono debe ser respetuoso y claro.`,
  prompt: `Genera un borrador de comunicación para padres de familia utilizando la plantilla "{{templateName}}".

Información contextual para la comunicación:
  {{#if contextData}}
    {{#if contextData.schoolName}}Nombre de la escuela: {{contextData.schoolName}}.{{/if}}
    {{#if contextData.schoolContactEmail}}Correo electrónico de contacto de la escuela: {{contextData.schoolContactEmail}}.{{/if}}
    {{#if contextData.schoolContactPhone}}Teléfono de contacto de la escuela: {{contextData.schoolContactPhone}}.{{/if}}

    {{#eq templateName "recordatorioDePago"}}
      Por favor, redacta un recordatorio de pago.
      {{#if contextData.guardianName}}Estimado(a) {{contextData.guardianName}},{{else}}Estimado(a) padre de familia,{{/if}}
      El estudiante es: {{contextData.studentName}}.
      El saldo pendiente es: {{contextData.outstandingBalance}} MXN.
      La fecha límite de pago es: {{contextData.dueDate}}.
      Asegúrate de incluir una línea sobre cómo ignorar el mensaje si el pago ya fue realizado.
    {{else if templateName "avisoDeEvento"}}
      Por favor, redacta un aviso de evento.
      Estimado(a) padre de familia,
      El nombre del evento es: {{contextData.eventName}}.
      La fecha del evento es: {{contextData.eventDate}}.
      La hora del evento es: {{contextData.eventTime}}.
      La ubicación del evento es: {{contextData.eventLocation}}.
      {{#if contextData.studentName}}El aviso es relevante para el estudiante: {{contextData.studentName}}.{{/if}}
    {{else if templateName "avisoGeneral"}}
      Por favor, redacta un aviso general.
      Estimado(a) padre de familia,
      {{#if contextData.additionalDetails}}Incluye los siguientes detalles: {{contextData.additionalDetails}}.{{/if}}
      {{#if contextData.studentName}}El aviso es relevante para el estudiante: {{contextData.studentName}}.{{/if}}
    {{/eq}}
  {{else}}
    No se proporcionaron datos contextuales específicos. Redacta un mensaje general basado en la plantilla "{{templateName}}".
  {{/if}}

  {{#if contextData.additionalDetails}}
  Información adicional a considerar: "{{contextData.additionalDetails}}".
  {{/if}}

El borrador final debe ser un mensaje completo, listo para ser enviado a los padres.
Asegúrate de incluir un saludo y una despedida apropiados.
El output debe ser solo el mensaje.
`
});

const smartParentCommunicationsDraftingFlow = ai.defineFlow(
  {
    name: 'smartParentCommunicationsDraftingFlow',
    inputSchema: SmartParentCommunicationsDraftingInputSchema,
    outputSchema: SmartParentCommunicationsDraftingOutputSchema,
  },
  async (input) => {
    const { output } = await smartParentCommunicationsDraftingPrompt(input);
    return output!;
  }
);