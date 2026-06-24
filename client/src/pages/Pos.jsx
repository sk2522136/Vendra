import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

// Services Endpoints Mapping
import { fetchProduct, createSale, getAllCategories, createStripeIntent, confirmStripePayment } from "../services/api.js";

// Import Components Matrix
import ProductSection from "../components/pos/ProductSection.jsx";
import CartSection from "../components/pos/CartSection.jsx";
import CheckoutForm from "../components/pos/CheckoutForm.jsx";

const stripePromise = loadStripe("pk_test_your_publishable_key_here");

const PosComponent = () => {
  const stripe = useStripe();
  const elements = useElements();

  // Component State Engine
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [savedCarts, setSavedCarts] = useState([]);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [showModal, setShowModal] = useState(false);
  const [receiptPdf, setReceiptPdf] = useState(null);

  useEffect(() => {
    loadProducts();
    loadSavedCarts();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await getAllCategories();
      setCategories(res.data.categories || []);
    } catch { toast.error("Failed to load categories"); }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetchProduct();
      setProducts(response.data.products || response.products || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch products");
    } finally { setLoading(false); }
  };

  const loadSavedCarts = () => {
    const saved = localStorage.getItem("savedCarts");
    if (saved) setSavedCarts(JSON.parse(saved));
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product) => {
    if (!product.quantity || product.quantity <= 0) { toast.error("Product out of stock!"); return; }
    const sellPrice = product.costPrice;
    const existingItem = cart.find((item) => item.productId === product._id);

    if (existingItem) {
      if (existingItem.qty >= product.quantity) { toast.error(`Only ${product.quantity} items available!`); return; }
      setCart(cart.map((item) => item.productId === product._id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { productId: product._id, name: product.name, price: sellPrice, qty: 1 }]);
    }
  };

  const increaseQty = (productId) => {
    const product = products.find((p) => p._id === productId);
    setCart((prevCart) => prevCart.map((item) => {
      if (item.productId === productId) {
        if (item.qty + 1 > product.quantity) { toast.error(`Only ${product.quantity} items available!`); return item; }
        return { ...item, qty: item.qty + 1 };
      }
      return item;
    }));
  };

  const decreaseQty = (productId) => {
    setCart(cart.map((item) => item.productId === productId && item.qty > 1 ? { ...item, qty: item.qty - 1 } : item).filter((item) => item.qty > 0));
  };

  const removeFromCart = (productId) => { setCart(cart.filter((item) => item.productId !== productId)); };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const totalAmount = Math.max(0, subtotal - discount);

  const saveCart = () => {
    if (cart.length === 0) { toast.error("Cart is empty!"); return; }
    const cartName = `Hold-${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const newCart = { id: Date.now(), name: cartName, items: cart };
    const updated = [...savedCarts, newCart];
    setSavedCarts(updated);
    localStorage.setItem("savedCarts", JSON.stringify(updated));
    toast.success("Cart put on hold!");
  };

  const loadSavedCart = (savedCart) => { setCart(savedCart.items); toast.success("Cart restored!"); };
  const deleteSavedCart = (id) => {
    const updated = savedCarts.filter((c) => c.id !== id);
    setSavedCarts(updated);
    localStorage.setItem("savedCarts", JSON.stringify(updated));
  };

  const completeSale = async () => {
    if (cart.length === 0) { toast.error("Cart is empty!"); return; }
    if (!customerName || !customerPhone) { toast.error("Customer Name and Phone Number are required!"); return; }

    try {
      setIsProcessingPayment(true);
      const saleData = {
        name: customerName,
        phoneNumber: customerPhone,
        items: cart.map((item) => ({ product: item.productId, quantity: item.qty, sellPrice: item.price })),
        customerType: paymentMethod === "card" ? "credit" : paymentMethod,
        paidAmount: paymentMethod === "cash" ? totalAmount : 0,
        discount: Number(discount),
        notes: notes,
      };

      if (paymentMethod !== "card") {
        const res = await createSale(saleData);
        if (res.data?.pdfData) { setReceiptPdf(res.data.pdfData); setShowModal(true); }
        toast.success("Transaction processed successfully!");
        resetForm();
        return;
      }

      if (!stripe || !elements) { toast.error("Stripe SDK loading error."); return; }

      const saleResponse = await createSale({ ...saleData, customerType: "credit" });
      const saleId = saleResponse.data?.sale?._id || saleResponse.data?._id;
      if (!saleId) throw new Error("Database mapping failed.");

      const intentRes = await createStripeIntent({ amount: totalAmount, saleId, currency: 'usd' });
      const { clientSecret, paymentIntentId } = intentRes.data;

      const cardElement = elements.getElement(CardElement);
      const stripeResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement, billing_details: { name: customerName, phone: customerPhone } },
      });

      if (stripeResult.error) throw new Error(stripeResult.error.message);

      if (stripeResult.paymentIntent.status === "succeeded") {
        const confirmRes = await confirmStripePayment({ paymentIntentId, saleId });
        if (confirmRes.data.success) {
          if (saleResponse.data?.pdfData) { setReceiptPdf(saleResponse.data.pdfData); setShowModal(true); }
          toast.success("Card Charged Successfully!");
          resetForm();
        }
      }
    } catch (error) {
      toast.error(error.message || "Transaction aborted.");
    } finally { setIsProcessingPayment(false); }
  };

  const resetForm = () => {
    setCart([]); setCustomerName(""); setCustomerPhone(""); setDiscount(0); setNotes(""); setPaymentMethod("cash");
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-bg-body">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-bg-primary"></div>
    </div>
  );

  return (
    <div className="flex flex-col xl:flex-row h-screen w-full bg-bg-body text-text font-sans overflow-y-auto xl:overflow-hidden p-2 sm:p-4 gap-4">
      {/* 1. PRODUCT STATION COMPONENT */}
      <ProductSection 
        products={filteredProducts} 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        categories={categories} 
        selectedCategory={selectedCategory} 
        setSelectedCategory={setSelectedCategory} 
        addToCart={addToCart} 
      />

      {/* RIGHT PANEL WRAPPER */}
      <div className="w-full xl:w-[420px] 2xl:w-[460px] flex flex-col bg-bg-card border border-border rounded-2xl shadow-sm shrink-0 h-auto min-h-[550px] xl:h-full mb-6 xl:mb-0 overflow-y-auto xl:overflow-hidden">
        {/* 2. CART LOGS STATION COMPONENT */}
        <CartSection 
          cart={cart} savedCarts={savedCarts} saveCart={saveCart} 
          loadSavedCart={loadSavedCart} deleteSavedCart={deleteSavedCart} 
          increaseQty={increaseQty} decreaseQty={decreaseQty} removeFromCart={removeFromCart} 
        />

        {/* 3. CHECKOUT SUMMARY BILLING STATION COMPONENT */}
        <CheckoutForm 
          customerName={customerName} setCustomerName={setCustomerName}
          customerPhone={customerPhone} setCustomerPhone={setCustomerPhone}
          discount={discount} setDiscount={setDiscount}
          notes={notes} setNotes={setNotes}
          paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
          subtotal={subtotal} totalAmount={totalAmount}
          isProcessingPayment={isProcessingPayment} completeSale={completeSale}
        />
      </div>

      {/* RECEIPT MODAL FRAME */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white w-full max-w-2xl h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-border">
            <div className="bg-neutral-900 text-white px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-neutral-300">LIVE INVOICE PREVIEW</span>
              <button onClick={() => setShowModal(false)} className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition"><FiX size={16} /></button>
            </div>
            <div className="flex-1 bg-neutral-100 p-2 sm:p-4 overflow-hidden relative">
              <iframe src={receiptPdf} title="POS Billing Engine" className="w-full h-full rounded-xl border bg-white shadow-inner" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Pos = () => (
  <Elements stripe={stripePromise}>
    <PosComponent />
  </Elements>
);

export default Pos;