
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Creates a Stripe Checkout Session for a student.
 * Multi-tenant routing: Sends money to the school's Connected Account if available.
 */
export async function POST(req: Request) {
  try {
    const { studentId, amount, schoolId, studentName, email } = await req.json();

    if (!studentId || !amount || !schoolId) {
      return NextResponse.json({ error: 'Faltan datos requeridos.' }, { status: 400 });
    }

    const { firestore } = initializeFirebase();
    const schoolSnap = await getDoc(doc(firestore, 'schools', schoolId));
    const schoolData = schoolSnap.data();
    const stripeAccountId = schoolData?.stripeAccountId;

    // Amount in cents
    const amountInCents = Math.round(amount * 100);

    const sessionOptions: any = {
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
              name: `Pago Escolar - ${studentName}`,
              description: `Abono a cuenta del alumno ID: ${studentId}`,
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
        studentId,
        schoolId,
        studentName,
      },
    };

    // Routing money to the Tenant (School's Account) via Stripe Connect
    if (stripeAccountId) {
      sessionOptions.transfer_data = {
        destination: stripeAccountId,
      };
    }

    const session = await stripe.checkout.sessions.create(sessionOptions);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
