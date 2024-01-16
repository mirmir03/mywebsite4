document.addEventListener('DOMContentLoaded', async () => {
  const publishableKey = 'pk_live_51OY67iLRe0DCzl0y4VCLDQLouuYQzM9FECRAbNkyhHMKduJviLg6BpKwEwY9B1GXtv4TBiQFxCug7J3RzCWpiqtT00JXhPVeMP';

  const stripe = Stripe('pk_live_51OY67iLRe0DCzl0y4VCLDQLouuYQzM9FECRAbNkyhHMKduJviLg6BpKwEwY9B1GXtv4TBiQFxCug7J3RzCWpiqtT00JXhPVeMP', {
    apiVersion: '2020-08-27',
  });
  const elements = stripe.elements();
  const fpxBank = elements.create('fpxBank', {
    accountHolderType: 'individual',
  });
  fpxBank.mount('#fpx-bank-element');

  // When the form is submitted...
  var form = document.getElementById('payment-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Make a call to the server to create a new
    // payment intent and store its client_secret.
    const {error: backendError, clientSecret} = await fetch(
      '/create-payment-intent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currency: 'myr',
          paymentMethodType: 'fpx',
        }),
      }
    ).then((r) => r.json());

    if (backendError) {
      addMessage(backendError.message);
      return;
    }

    addMessage(`Client secret returned.`);

    // Confirm the fpxBank payment given the clientSecret
    // from the payment intent that was just created on
    // the server.
    const {error: stripeError, paymentIntent} = await stripe.confirmFpxPayment(
      clientSecret,
      {
        payment_method: {
          fpx: fpxBank,
        },
        return_url: `${window.location.origin}/return.html`,
      }
    );

    if (stripeError) {
      addMessage(stripeError.message);
    }

    addMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);
  });
});
