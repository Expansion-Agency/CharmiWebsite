/* import axios from "axios";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function PaymentPage() {
  const API_BASE_URL = process.env.REACT_APP_API_URL;
  const location = useLocation();
  const navigate = useNavigate();

  // Get checkout data
  const { cart, totalPrice, address } = location.state || {
    cart: [],
    totalPrice: 0,
    address: null,
  };

  console.log("Cart:", cart);
  console.log("Total Price:", totalPrice);
  console.log("Shipping Address:", address);

  const handlePaymentSuccess = async (paymentResult) => {
    try {
      const token = localStorage.getItem("token");

      const orderData = {
        total: totalPrice,
        addressId: address.Addresses.id,
        orderItems: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          priceEgp: parseInt(item.priceEgp, 10),
          priceUsd: parseInt(item.priceUsd, 10),
        })),
        paymentInfo: paymentResult, // optional if you store transaction details
      };

      await axios.post(`${API_BASE_URL}/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Order placed successfully!");
      localStorage.removeItem("cart");
      navigate("/order-success", { state: { cart: [], totalPrice: 0 } });
    } catch (error) {
      console.error("Error placing order:", error.response?.data || error);
      alert(
        `Failed to place order: ${
          error.response?.data?.message || "Unknown error"
        }`
      );
    }
  };

  const [billing, setBilling] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    apartment: "",
    floor: "",
    shipping_method: "PKG",
    postal_code: "",
    city: "",
    country: "EG",
    state: "",
    street: "",
  });

  const [paymentUrl, setPaymentUrl] = useState("");

  function handleChange(e) {
    setBilling({ ...billing, [e.target.name]: e.target.value });
  }

  async function startPayment() {
    try {
      const response = await fetch(`https://api.charmi.shop/payment/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalPrice,
          billing: billing,
        }),
      });

      if (!response.ok) {
        const text = await response.text(); // fallback to read error text
        throw new Error(`HTTP ${response.status} - ${text}`);
      }

      const data = await response.json();
      setPaymentUrl(data.paymentPageUrl);
    } catch (err) {
      console.error("Payment initiation failed:", err);
      alert("Failed to initiate payment. Check console for details.");
    }
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Billing Information</h2>
      <form
        className="row g-3"
        onSubmit={(e) => {
          e.preventDefault();
          startPayment();
        }}
      >
        <div className="col-md-6">
          <input
            className="form-control"
            name="first_name"
            placeholder="First Name"
            value={billing.first_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-6">
          <input
            className="form-control"
            name="last_name"
            placeholder="Last Name"
            value={billing.last_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-6">
          <input
            className="form-control"
            name="email"
            placeholder="Email"
            value={billing.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-6">
          <input
            className="form-control"
            name="phone_number"
            placeholder="Phone Number"
            value={billing.phone_number}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-4">
          <input
            className="form-control"
            name="apartment"
            placeholder="Apartment"
            value={billing.apartment}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-4">
          <input
            className="form-control"
            name="floor"
            placeholder="Floor"
            value={billing.floor}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-4">
          <input
            className="form-control"
            name="postal_code"
            placeholder="Postal Code"
            value={billing.postal_code}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-4">
          <input
            className="form-control"
            name="city"
            placeholder="City"
            value={billing.city}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-4">
          <input
            className="form-control"
            name="state"
            placeholder="State"
            value={billing.state}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-4">
          <input
            className="form-control"
            name="street"
            placeholder="Street"
            value={billing.street}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-12 text-center mt-3">
          <button className="btn btn-primary" type="submit">
            Pay Now
          </button>
        </div>
      </form>

      {paymentUrl && (
        <div className="mt-5">
          <h4>Payment Page</h4>
          <iframe
            src={paymentUrl}
            width="100%"
            height="600"
            frameBorder="0"
            allowFullScreen
            title="Payment"
            className="border rounded"
          />
          <button
            className="btn btn-success mt-3"
            onClick={() => handlePaymentSuccess({ transactionId: "demo-123" })}
          >
            Confirm Payment Success
          </button>
        </div>
      )}
    </div>
  );
}
 */