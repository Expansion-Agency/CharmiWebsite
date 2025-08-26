import React, { useState } from 'react';

export default function PaymentPage({ price }) {
  const [billing, setBilling] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    apartment: '',
    floor: '',
    shipping_method: 'PKG',
    postal_code: '',
    city: '',
    country: 'EG',
    state: '',
    street: '',
  });

  const [paymentUrl, setPaymentUrl] = useState('');

  function handleChange(e) {
    setBilling({ ...billing, [e.target.name]: e.target.value });
  }

  async function startPayment() {
    const response = await fetch('/payment/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: price, 
        billing,
      }),
    });

    const data = await response.json();
    setPaymentUrl(data.paymentPageUrl);
  }

  return (
    <div>
      <h2>Billing Information</h2>
      <form onSubmit={e => { e.preventDefault(); startPayment(); }}>
        <input name="first_name" placeholder="First Name" value={billing.first_name} onChange={handleChange} required />
        <input name="last_name" placeholder="Last Name" value={billing.last_name} onChange={handleChange} required />
        <input name="email" placeholder="Email" value={billing.email} onChange={handleChange} required />
        <input name="phone_number" placeholder="Phone Number" value={billing.phone_number} onChange={handleChange} required />
        <input name="apartment" placeholder="Apartment" value={billing.apartment} onChange={handleChange} />
        <input name="floor" placeholder="Floor" value={billing.floor} onChange={handleChange} />
        <input name="postal_code" placeholder="Postal Code" value={billing.postal_code} onChange={handleChange} />
        <input name="city" placeholder="City" value={billing.city} onChange={handleChange} required />
        <input name="state" placeholder="State" value={billing.state} onChange={handleChange} required />
        <input name="street" placeholder="Street" value={billing.street} onChange={handleChange} required />

        <button type="submit">Pay Now</button>
      </form>

      {paymentUrl && (
        <iframe
          src={paymentUrl}
          width="100%"
          height="600"
          frameBorder="0"
          allowFullScreen
          title="Payment"
        />
      )}
    </div>
  );
}
