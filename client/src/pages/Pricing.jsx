import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPricingPlans, createSubscription, upgradeSubscription,confirmStripePayment } from '../services/api.js';
import { useAuth } from "../context/AuthContext";
import { useSearchParams } from "react-router-dom";
import { toast } from 'react-toastify';


const Pricing = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, setUser } = useAuth();
  const [verifyingPayment, setVerifyingPayment] = useState(false); 
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");



useEffect(() => {
    if (!sessionId) return;

    const verifyPayment = async () => {
      setVerifyingPayment(true);
      try {
        console.log("--> Confirming session ID with backend:", sessionId);
        const res = await confirmStripePayment( sessionId );
        
        if (res.data?.success) {
          const updatedOrg = res.data.organization;
          
          const updatedUser = {
            ...user,
            subscriptionPlan: "pro",
            subscriptionStatus: "active",
            subscriptionEndDate: updatedOrg?.subscriptionEndDate,
            organization: updatedOrg
          };

          localStorage.setItem("vendra_user", JSON.stringify(updatedUser));
          if (setUser) setUser(updatedUser);

          toast.success("Payment Confirmed! Redirecting to Dashboard...");

          setTimeout(() => {
            window.location.href = user?.role === "admin" ? "/dashboard" : "/pos";
          }, 1000);
        }
      } catch (err) {
        console.error("Payment Confirmation Error:", err);
        setError(err.response?.data?.message || "Payment verification failed.");
        setVerifyingPayment(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const res = await getPricingPlans();
        if (res.data?.success) {
          setPlans(res.data.plans || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch pricing plans.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);


  


  const handleSelectPlan = async (planId) => {
  try {
    setError("");

    const res = await createSubscription({ planId });

    if (res.data?.success) {
      if (planId === "free") {
        const updatedOrg = res.data.organization;

        const updatedUser = {
          ...user,
          subscriptionPlan: "free",
          subscriptionStatus: "active",
          subscriptionEndDate: updatedOrg?.subscriptionEndDate,
          organization: updatedOrg
        };

        localStorage.setItem("vendra_user", JSON.stringify(updatedUser));

        if (setUser) {
          setUser(updatedUser);
        }

          const targetRoute = user?.role === "admin" ? "/dashboard" : "/pos";
      window.location.href = targetRoute;
      return;
      } 
      else if (res.data?.url || res.data?.sessionUrl) {
        window.location.href = res.data.url || res.data.sessionUrl;
      }
    }
  } catch (err) {
    console.error("Subscription Error:", err);
    setError(err.response?.data?.message || "Subscription failed. Please try again.");
  }
};

 if (loading) return <div style={{ textAlign: "center", marginTop: "100px" }}>Loading plans...</div>;

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px", textAlign: "center" }}>
      <h2>Choose Your Plan</h2>
      <p style={{ color: "#666" }}>Get started with a 1-week free trial or unlock full access with Pro.</p>

      {error && (
        <div style={{ color: "red", backgroundColor: "#ffe6e6", padding: "10px", borderRadius: "8px", margin: "20px 0" }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "30px", justifyContent: "center", marginTop: "30px" }}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            style={{
              border: plan.id === "pro" ? "2px solid #007bff" : "1px solid #ccc",
              borderRadius: "12px",
              padding: "24px",
              width: "320px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
              justify: "space-between"
            }}
          >
            <div>
              <h3>{plan.name}</h3>
              <h4 style={{ fontSize: "28px", margin: "12px 0" }}>
                ${plan.price} <span style={{ fontSize: "14px", color: "#888" }}>/ {plan.period}</span>
              </h4>
              <p style={{ fontSize: "14px", color: "#555" }}>{plan.description}</p>
              <ul style={{ textAlign: "left", paddingLeft: "20px", fontSize: "14px", color: "#444", marginTop: "15px" }}>
                {plan.features?.map((feature, index) => (
                  <li key={index} style={{ marginBottom: "6px" }}>{feature}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan(plan.id)}
              style={{
                backgroundColor: plan.id === "pro" ? "#007bff" : "#28a745",
                color: "#fff",
                border: "none",
                padding: "12px 18px",
                borderRadius: "6px",
                cursor: "pointer",
                marginTop: "24px",
                fontWeight: "bold",
                fontSize: "15px"
              }}
            >
              {plan.price === 0
                ? "Start 7-Day Free Trial"
                : user?.subscriptionPlan === "free"
                ? "Upgrade to Pro"
                : "Select Pro Plan"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;