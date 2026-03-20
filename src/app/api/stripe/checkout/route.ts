
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

/**
 * Creates a Stripe Checkout Session for a student to pay their outstanding balance.
 * Supports Mexican payment methods: Cards, OXXO, and SPEI.
 */
export async function POST(req: Request) {
  try {
    const { studentId, amount, schoolId, studentName, email } = await req.json();

    if (!studentId || !amount || !schoolId) {
      return NextResponse.json({ error: 'Faltan datos requeridos.' }, { status: 400 });
    }

    // Amount must be in cents for Stripe (MXN uses 2 decimals)
    const amountInCents = Math.round(amount * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'oxxo', 'customer_balance'],
      payment_method_options: {
        customer_balance: {
          funding_type: 'bank_transfer',
          bank_transfer: {
            type: 'mx_bank_transfer',
          },
        },
      },
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: `Pago de Colegiatura / Servicios Escolares - ${studentName}`,
              description: `Abono a cuenta del alumno con ID: ${studentId}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/pagos?success=true`,
      cancel_url: `${req.headers.get('origin')}/pagos?canceled=true`,
      customer_email: email || undefined,
      metadata: {
        studentId, // This is the Firestore Document ID
        schoolId,
        studentName,
        paymentType: 'online_stripe',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating Stripe session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
