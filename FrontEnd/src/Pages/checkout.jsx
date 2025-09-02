import React, { useEffect, useState } from "react";
import "./checkout.css";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "../TranslationContext";
import { useCurrency } from "../CurrencyContext";
import { usePriceVisibility } from "../PriceVisibilityContext";

export default function Checkout() {
  const { hidePrices } = usePriceVisibility();
  const API_BASE_URL = process.env.REACT_APP_API_URL;
  const { translations, language } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, totalPrice } = location.state || { cart: [], totalPrice: 0 };
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [defaultAddressId, setDefaultAddressId] = useState(null);
  const [countryName, setCountryName] = useState("");
  const [cityName, setCityName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const { selectedCurrency, convertAmount } = useCurrency();
  const [paymentUrl, setPaymentUrl] = useState("");
  const [locationNames, setLocationNames] = useState({
    country: "",
    city: "",
    district: "",
  });

  const [formData, setFormData] = useState({
    firstname: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    cardname: "",
    cardnumber: "",
    expmonth: "",
    expyear: "",
    cvv: "",
    sameadr: true,
  });

  const fetchLocationName = async (id, type) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${type}/${id}`);
      if (type === "district") {
        return response.data.districtName;
      }
      return response.data.name; // Assuming API returns { name: "City Name" }
    } catch (error) {
      console.error(`Error fetching ${type} name:`, error);
      return "";
    }
  };

  useEffect(() => {
    const fetchDefaultAddress = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        if (!token || !userId) {
          alert("Unauthorized: Please log in again");
          return;
        }

        const response = await axios.get(
          `${API_BASE_URL}/address/user/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const defaultAddr = response.data.find((address) => address.isDefault);
        if (!defaultAddr) {
          alert(`${translations.crtadd}`);
          navigate("/profile");
          return;
        }

        const { countryId, cityId, districtId } = defaultAddr.Addresses;
        const locationResponses = await Promise.all([
          axios.get(`${API_BASE_URL}/country/${countryId}`),
          axios.get(`${API_BASE_URL}/cities/${cityId}`),
          axios.get(`${API_BASE_URL}/district/${districtId}`),
        ]);

        const locationData = {
          country: locationResponses[0].data.name,
          city: locationResponses[1].data.name,
          district: locationResponses[2].data.districtName,
        };

        setDefaultAddress(defaultAddr);
        setLocationNames(locationData);

        setFormData((prev) => ({
          ...prev,
          firstname: defaultAddr.fullName || "",
          email: defaultAddr.email || "",
          address: `${defaultAddr.Addresses.buildingNumber}, ${defaultAddr.Addresses.streetName}`,
          country: locationData.country,
          city: locationData.city,
          district: locationData.district,
          building: defaultAddr.Addresses.buildingNumber || "",
          apartment: defaultAddr.Addresses.apartmentNumber || "",
        }));
      } catch (error) {
        console.error("Error fetching default address:", error);
      }
    };

    fetchDefaultAddress();
  }, []);

  useEffect(() => {
    if (
      defaultAddress &&
      defaultAddress.Addresses &&
      countryName &&
      cityName &&
      districtName
    ) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        firstname: defaultAddress.fullName || "",
        email: defaultAddress.email || "",
        address:
          `${defaultAddress.Addresses.buildingNumber}, ${defaultAddress.Addresses.streetName}` ||
          "",
        country: countryName,
        city: cityName,
        district: districtName,
        building: defaultAddress.Addresses.buildingNumber || "",
        apartment: defaultAddress.Addresses.apartmentNumber || "",
      }));
    }
  }, [defaultAddress, countryName, cityName, districtName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!defaultAddress) {
      alert(`${translations.nodefadd}`);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/payment/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalPrice,
          billingData: {
            first_name: defaultAddress.fullName?.split(" ")[0] || "NA",
            last_name: defaultAddress.fullName?.split(" ")[1] || "NA",
            email: defaultAddress.email,
            phone_number: defaultAddress.phoneNumber,
            apartment: defaultAddress.Addresses.apartmentNumber || "NA",
            floor: "NA",
            building: defaultAddress.Addresses.buildingNumber || "NA",
            street: defaultAddress.Addresses.streetName,
            city: locationNames.city,
            state: locationNames.district,
            postal_code: "NA",
            country: "EG",
            shipping_method: "PKG",
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Payment initiation failed");
      }

      const data = await response.json();
      setPaymentUrl(data.paymentPageUrl);
    } catch (error) {
      console.error("Payment initiation failed:", error);
      alert("Failed to initiate payment");
    }
  };

  return (
    <div className="checkout-container">
      <h2 className="title">{translations.checkout}</h2>
      <div className="checkrow">
        <div className="col-75">
          <div className="checkcontainer">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-50">
                  <h3 className="mb-3">{translations.shippingAdd}</h3>
                  <label>{translations.fullName}</label>
                  <input
                    type="text"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                    placeholder="John M. Doe"
                    required
                  />
                  <label>{translations.email}</label>
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                  />
                  <label>{translations.address}</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="542 W. 15th Street"
                    required
                  />
                  <div className="row">
                    <div className="col-50">
                      <label>{translations.country}</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="New York"
                        required
                      />
                    </div>
                    <div className="col-50">
                      <label>{translations.city}</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="New York"
                        required
                      />
                    </div>
                  </div>
                  <label>{translations.district}</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="NY"
                    required
                  />
                  <div className="row">
                    <div className="col-50">
                      <label>{translations.buildingNo}</label>
                      <input
                        type="text"
                        name="bulding"
                        value={formData.building}
                        onChange={handleChange}
                        placeholder="10"
                        required
                      />
                    </div>
                    <div className="col-50">
                      <label>{translations.apartmentNo}</label>
                      <input
                        type="text"
                        name="apartment"
                        value={formData.apartment}
                        onChange={handleChange}
                        placeholder="6"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn">
                {translations.checkoutCon}
              </button>
            </form>
          </div>
        </div>

        <div className="col-25">
          <div className="ordcontainer">
            <div className="ordertop">
              <h4>{translations.orderSum}</h4>
              <h4>
                <span className="">
                  <i className="fa fa-shopping-cart"></i> <b>{cart.length}</b>
                </span>
              </h4>
            </div>

            {cart.map((item) => {
              console.log(item);

              const convertedPrice =
                selectedCurrency === "egp"
                  ? item.productInfo?.priceEgp
                  : item.productInfo?.priceUsd;
              const discountAmount = item.productInfo.discount
                ? selectedCurrency === "egp"
                  ? item.productInfo.priceEgp *
                    (item.productInfo.discount.percentage / 100)
                  : item.productInfo.priceUsd *
                    (item.productInfo.discount.percentage / 100)
                : 0;
              const discountedPrice = convertedPrice - discountAmount;

              return (
                <div className="prodOrd" key={item.productId}>
                  <img
                    src={`https://${item.productInfo.image}`}
                    alt={item.name}
                  />{" "}
                  <p>
                    {language === "ar"
                      ? item.productInfo.nameAr
                      : item.productInfo.nameEn}
                  </p>
                  <span className="price">
                    x {item.quantity}
                    {hidePrices ? null : item.productInfo.discount ? (
                      <>
                        <span
                          className="d-block"
                          style={{
                            textDecoration: "line-through",
                            color: "gray",
                          }}
                        >
                          {selectedCurrency === "egp"
                            ? `${translations.egp} ${Math.round(
                                item.productInfo.priceEgp * item.quantity
                              )}`
                            : `$ ${Math.round(
                                item.productInfo.priceUsd * item.quantity
                              )}`}
                        </span>{" "}
                        <span
                          className="d-block"
                          style={{ color: "green", fontWeight: "bold" }}
                        >
                          {selectedCurrency === "egp"
                            ? `${translations.egp} ${Math.round(
                                discountedPrice * item.quantity
                              )}`
                            : `$ ${Math.round(
                                discountedPrice * item.quantity
                              )}`}
                        </span>
                      </>
                    ) : (
                      <span>
                        {selectedCurrency === "egp"
                          ? `${translations.egp} ${Math.round(
                              item.productInfo.priceEgp * item.quantity
                            )}`
                          : `$ ${Math.round(
                              item.productInfo.priceUsd * item.quantity
                            )}`}
                      </span>
                    )}
                  </span>
                </div>
              );
            })}

            <hr className="checkhr" />
            <div className="total d-flex justify-content-between">
              <p>{translations.totalPrice} </p>
              <span className="price">
                <b>
                  {selectedCurrency === "egp" ? `${translations.egp}` : `$`}{" "}
                  {Math.round(totalPrice)}
                </b>
              </span>
            </div>
          </div>
          {paymentUrl && (
            <div className="mt-5">
              <h4>{translations.pay}</h4>
              <iframe
                src={paymentUrl}
                width="100%"
                height="600"
                frameBorder="0"
                allowFullScreen
                title="Payment"
                className="border rounded"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
