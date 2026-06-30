import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import VoiceRecorder from "../components/voicerecord/VoiceRecorder.jsx"; 
import { fetchProduct, createSale, getAllCategories, createStripeIntent, confirmStripePayment } from "../services/api.js";
import ProductSection from "../components/pos/ProductSection.jsx";
import CartSection from "../components/pos/CartSection.jsx";
import CheckoutForm from "../components/pos/CheckoutForm.jsx";
import { saveSaleToLocalStorage, savePaymentToLocalStorage } from '../utils/localStorageService.js';

const stripePromise = loadStripe("pk_test_51Sx5sTPzorG2nWHVkDEKxfrOM83q8dao510Yur0skylQ2nHVTaPGxG648R88fdC17eXbiDpUl7TIXtsIRPNem2sk00NGTzqLvx");

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
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);

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
    
    // Default system cost price yahan set hogi, jise admin cart me badal sakega
    const sellPrice = product.costPrice || 0; 
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

  // 🔥 DYNAMIC MATH MATRIX: Yeh real-time mein badli hui admin price ko calculate karta hai
  const subtotal = cart.reduce((acc, item) => acc + (Number(item.price) || 0) * item.qty, 0);
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
      
      // 🔥 PAYLOAD SNAPSHOT: Isme item.price direct admin input box se map ho kar backend par ja rhi hai
      const saleData = {
        name: customerName,
        phoneNumber: customerPhone,
        items: cart.map((item) => ({ 
          product: item.productId, 
          quantity: item.qty, 
          sellPrice: Number(item.price) || 0  // Admin ki overwrite ki hui current price
        })),
        customerType: paymentMethod === "card" ? "cash" : paymentMethod,
        paidAmount: paymentMethod === "cash" ? totalAmount : 0,
        discount: Number(discount),
        notes: notes,
      };

      if (paymentMethod !== "card") {
        const res = await createSale(saleData);
        if (res.data?.sale) {
          saveSaleToLocalStorage({
            saleId: res.data.sale._id,
            totalAmount: res.data.sale.totalAmount,
            paidAmount: res.data.sale.paidAmount,
            items: res.data.sale.items.length,
            customer: res.data.sale.customer,
            timestamp: new Date().toISOString()
          });
        }
        if (res.data?.pdfData) { 
          setReceiptPdf(res.data.pdfData); setShowModal(true); 
        }
        toast.success("Transaction processed successfully!");
        resetForm();
        return;
      }

      if (!stripe || !elements) { toast.error("Stripe SDK loading error."); return; }

      const saleResponse = await createSale({ ...saleData, customerType: "cash" });
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
          savePaymentToLocalStorage({
            paymentId: paymentIntentId,
            amount: totalAmount,
            saleId: saleId,
            method: paymentMethod,
            timestamp: new Date().toISOString()
          });
        
          if (saleResponse.data?.pdfData) {
            setReceiptPdf(saleResponse.data.pdfData); setShowModal(true); 
          }
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

  const handleVoiceCommand = (commandData) => {
    const { action, product, quantity, paymentMethod } = commandData;

    if (action === "ADD_TO_CART" && product) {
      const targetProduct = products.find(
        (p) => p.name && p.name.toLowerCase() === product.toLowerCase()
      );

      if (targetProduct) {
        const qtyToAdd = quantity || 1;
        for (let i = 0; i < qtyToAdd; i++) {
          addToCart(targetProduct);
        }
        toast.success(`Added ${qtyToAdd}x ${targetProduct.name} to cart via voice!`);
      } else {
        toast.error(`Product "${product}" not found in inventory.`);
      }
    } 
    else if (action === "CHECKOUT") {
      if (paymentMethod === "cash" || paymentMethod === "credit") {
        setPaymentMethod(paymentMethod);
        toast.success(`Payment method set to ${paymentMethod.toUpperCase()}. Finalizing sale...`);
        completeSale();
      } else {
        toast.warning("Please specify a valid payment method (cash or credit).");
      }
    } 
    else {
      toast.info("Voice command recognized but action could not be identified.");
    }
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
          cart={cart} 
          setCart={setCart} // 🔥 Pass setCart down to modify prices dynamically inside cart
          savedCarts={savedCarts} 
          saveCart={saveCart} 
          loadSavedCart={loadSavedCart} 
          deleteSavedCart={deleteSavedCart} 
          increaseQty={increaseQty} 
          decreaseQty={decreaseQty} 
          removeFromCart={removeFromCart} 
          isVoiceEnabled={isVoiceEnabled}
          setIsVoiceEnabled={setIsVoiceEnabled}
        />

        {/* 3. CHECKOUT and BILLING */}
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

      {isVoiceEnabled && (
        <VoiceRecorder 
          onCommand={handleVoiceCommand} 
          onClose={() => setIsVoiceEnabled(false)} 
        />
      )}

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