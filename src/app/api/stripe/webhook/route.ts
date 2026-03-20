
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { initializeFirebase } from '@/firebase';
import { doc, collection, addDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Stripe Webhook Handler.
 * Listens for payment confirmation and updates Firestore automatically.
 */
export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const { firestore } = initializeFirebase();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const metadata = session.metadata;

    if (metadata && metadata.studentId && metadata.schoolId) {
      try {
        const studentId = metadata.studentId;
        const schoolId = metadata.schoolId;
        const amountPaid = session.amount_total ? session.amount_total / 100 : 0;

        // 1. Get current student balance
        const studentRef = doc(firestore, 'students', studentId);
        const studentSnap = await getDoc(studentRef);

        if (studentSnap.exists()) {
          const currentBalance = studentSnap.data().outstandingBalance || 0;
          const newBalance = Math.max(0, currentBalance - amountPaid);

          // 2. Update Student Balance
          await updateDoc(studentRef, {
            outstandingBalance: newBalance,
            updatedAt: serverTimestamp(),
          });

          // 3. Register the payment in the history
          const paymentsRef = collection(firestore, 'students', studentId, 'payments');
          await addDoc(paymentsRef, {
            schoolId,
            studentId,
            studentName: metadata.studentName || 'Alumno',
            totalAmount: amountPaid,
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod: 'Stripe Online',
            stripeSessionId: session.id,
            receivedFrom: session.customer_details?.name || 'Pago en Línea',
            remainingBalanceAfterThis: newBalance,
            status: 'completado',
            items: [
              {
                id: 'stripe-' + Date.now(),
                name: 'Pago en Línea (Stripe)',
                amount: amountPaid,
                type: 'online'
              }
            ],
            createdAt: serverTimestamp(),
          });

          console.log(`Payment processed for student ${studentId}: $${amountPaid}`);
        }
      } catch (error) {
        console.error('Error updating Firestore from webhook:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
