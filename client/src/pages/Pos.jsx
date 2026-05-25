import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiShoppingCart,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiCreditCard,
  FiDollarSign,
  FiFilter,
  FiSave,
} from "react-icons/fi";

import { fetchProduct, createSale, getAllCategories } from "../services/api.js";
import { toast } from "react-toastify";

const Pos = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [savedCarts, setSavedCarts] = useState([]);

  const [productPrices, setProductPrices] = useState({});

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadProducts();
    loadSavedCarts();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await getAllCategories();
      setCategories(res.data.categories || []);
    } catch (error) {
      toast.error("Failed to load categories");
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);

      const response = await fetchProduct();

      setProducts(response.data.products || response.products || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const loadSavedCarts = () => {
    const saved = localStorage.getItem("savedCarts");

    if (saved) {
      setSavedCarts(JSON.parse(saved));
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const addToCart = (product, customPrice = null) => {
    if (!product.quantity || product.quantity <= 0) {
      toast.error("Product out of stock!");
      return;
    }

    const sellPrice =
      customPrice || productPrices[product._id] || product.costPrice;

    const existingItem = cart.find(
      (item) => item.productId === product._id
    );

    if (existingItem) {
      if (existingItem.qty >= product.quantity) {
        toast.error(`Only ${product.quantity} items available!`);
        return;
      }

      setCart(
        cart.map((item) =>
          item.productId === product._id
            ? { ...item, qty: item.qty + 1, price: sellPrice }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product._id,
          name: product.name,
          price: sellPrice,
          qty: 1,
        },
      ]);
    }
  };

  const increaseQty = (productId) => {
    const product = products.find((p) => p._id === productId);

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.productId === productId) {
          if (item.qty + 1 > product.quantity) {
            toast.error(`Only ${product.quantity} items available!`);
            return item;
          }

          return { ...item, qty: item.qty + 1 };
        }

        return item;
      })
    );
  };

  const decreaseQty = (productId) => {
    setCart(
      cart
        .map((item) =>
          item.productId === productId && item.qty > 1
            ? { ...item, qty: item.qty - 1 }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  const totalAmount = subtotal;

  const saveCart = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty!");
      return;
    }

    const cartName = `Cart-${new Date().toLocaleTimeString()}`;

    const newCart = {
      id: Date.now(),
      name: cartName,
      items: cart,
      subtotal,
    };

    const updated = [...savedCarts, newCart];

    setSavedCarts(updated);

    localStorage.setItem("savedCarts", JSON.stringify(updated));

    toast.success("Cart saved successfully!");
  };

  const loadSavedCart = (savedCart) => {
    setCart(savedCart.items);
    toast.success("Cart loaded!");
  };

  const deleteSavedCart = (id) => {
    const updated = savedCarts.filter((c) => c.id !== id);

    setSavedCarts(updated);

    localStorage.setItem("savedCarts", JSON.stringify(updated));

    toast.success("Cart deleted!");
  };

  const completeSale = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty!");
      return;
    }

    if (!customerName || !customerPhone) {
      toast.error("Please fill in customer details!");
      return;
    }

    try {
      const saleData = {
        name: customerName,
        phoneNumber: customerPhone,

        items: cart.map((item) => ({
          product: item.productId,
          quantity: item.qty,
          sellPrice: item.price,
        })),

        customerType: paymentMethod,

        paidAmount: paymentMethod === "cash" ? totalAmount : 0,
      };

      await createSale(saleData);

      toast.success("Sale complete!");

      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setPaymentMethod("cash");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to complete sale");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-body">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bg-primary mx-auto mb-4"></div>

          <p className="text-bg-primary font-semibold">
            Loading...
          </p>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col min-h-screen xl:h-screen p-2 sm:p-4 lg:p-5 bg-bg-body overflow-hidden">
      {/* HEADER */}

      <div className="mb-5 pl-1 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-bg-primary to-bg-secondary rounded-2xl shadow-lg">
            <FiShoppingCart className="text-white" size={24} />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl xl:text-4xl font-black text-black uppercase leading-tight tracking-tight">
              Point Of Sale
            </h1>

            <p className="text-sm text-muted font-medium mt-1">
              Process transactions with modern responsive POS
            </p>
          </div>
        </div>
      </div>

      {/* MAIN */}

      <div className="flex flex-col xl:flex-row gap-4 flex-1 overflow-hidden min-h-0">
        {/* LEFT SIDE */}

        <div className="flex-1 w-full min-h-[50vh] xl:h-full flex flex-col bg-bg-card border border-border rounded-3xl p-3 sm:p-4 lg:p-5 overflow-hidden shadow-sm">
          {/* SEARCH */}

          <div className="flex flex-col sm:flex-row gap-3 mb-4 shrink-0">
            <div className="relative flex-1">
              <FiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                size={18}
              />

              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-bg-card border border-border text-text rounded-2xl pl-10 pr-3 py-3 outline-none transition-all focus:ring-2 focus:ring-bg-primary focus:border-bg-primary placeholder:text-muted"
              />
            </div>

            <div className="relative w-full sm:w-56">
              <FiFilter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                size={16}
              />

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-bg-card border border-border text-text rounded-2xl pl-10 pr-3 py-3 outline-none appearance-none transition-all focus:ring-2 focus:ring-bg-primary focus:border-[--color-bg-primary]"
              >
                <option value="All">All Categories</option>

                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PRODUCTS */}

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 mt-2 gap-3">
              {filteredProducts.map((p) => (
                <div
                  key={p._id}
                  className="bg-bg-card border border-border rounded-2xl p-3 cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-bg-primary active:scale-95 overflow-hidden"
                >
                  {/* IMAGE */}

                  <div className="h-20 sm:h-28 bg-hover rounded-xl mb-2 overflow-hidden">
                    <img
                      src={p.image?.url || "placeholder"}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {/* NAME */}

                  <h4 className="font-bold text-text text-sm truncate mb-2 uppercase">
                    {p.name}
                  </h4>

                  {/* PRICE */}

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-bg-primary font-black text-sm">
                      Rs {productPrices[p._id] || p.costPrice}
                    </span>

                    <button
                      onClick={() =>
                        addToCart(p, productPrices[p._id])
                      }
                      disabled={p.quantity === 0}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md transition-all ${
                        p.quantity > 0
                          ? "bg-gradient-to-r from-bg-primary to-bg-secondary text-white hover:scale-105"
                          : "bg-gray-300 text-white cursor-not-allowed"
                      }`}
                    >
                      <FiPlus />
                    </button>
                  </div>

                  
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}

        <div className="w-full xl:w-[420px] 2xl:w-[460px] min-h-[40vh] xl:h-full flex flex-col shrink-0">
          <div className="flex flex-col h-full bg-bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
            {/* HEADER */}

            <div className="p-4 border-b border-border bg-gradient-to-r from-bg-primary to-bg-secondary flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20">
                <FiShoppingCart className="text-white" />
              </div>

              <div>
                <h2 className="text-white font-black uppercase text-sm">
                  Shopping Cart
                </h2>

                <p className="text-blue-100 text-sm">
                  {cart.length} Items
                </p>
              </div>
            </div>

            {/* SAVED CARTS */}

            {savedCarts.length > 0 && (
              <div className="p-3 border-b border-border bg-hover overflow-x-auto no-scrollbar">
                <div className="flex gap-2">
                  {savedCarts.map((sc) => (
                    <div
                      key={sc.id}
                      className="min-w-max bg-white border border-border rounded-xl p-2"
                    >
                      <p className="font-bold text-sm text-text">
                        {sc.name}
                      </p>

                      <div className="flex gap-1 mt-2">
                        <button
                          onClick={() => loadSavedCart(sc)}
                          className="px-3 py-1 rounded-lg bg-bg-primary text-black text-xs"
                        >
                          Load
                        </button>

                        <button
                          onClick={() => deleteSavedCart(sc.id)}
                          className="px-3 py-1 rounded-lg bg-red-500 text-white text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CART ITEMS */}

            <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar p-3 space-y-3">
              {cart.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <FiShoppingCart className="w-12 h-12 text-muted mx-auto mb-3" />

                    <p className="text-muted font-medium">
                      CART IS EMPTY
                    </p>
                  </div>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.productId}
                    className="bg-hover border border-border rounded-2xl p-3"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-text uppercase">
                          {item.name}
                        </h4>
                      </div>

                      {/* QTY */}

                      <div className="flex items-center gap-2 bg-white border border-border rounded-xl px-2 py-1">
                        <button
                          onClick={() =>
                            decreaseQty(item.productId)
                          }
                        >
                          <FiMinus size={14} />
                        </button>

                        <span className="font-bold text-sm text-text">
                          {item.qty}
                        </span>

                        <button
                          onClick={() =>
                            increaseQty(item.productId)
                          }
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>

                      {/* DELETE */}

                      <button
                        onClick={() =>
                          removeFromCart(item.productId)
                        }
                        className="text-red-500"
                      >
                        <FiTrash2 />
                      </button>
                    </div>

                    {/* PRICE */}

                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="text-xs font-bold text-muted">
                          Sell Price
                        </label>

                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => {
                            const newPrice =
                              parseFloat(e.target.value) ||
                              item.price;

                            setCart(
                              cart.map((cartItem) =>
                                cartItem.productId === item.productId
                                  ? {
                                      ...cartItem,
                                      price: newPrice,
                                    }
                                  : cartItem
                              )
                            );
                          }}
                          className="w-full bg-white text-black border border-border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-bg-primary"
                        />
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-muted font-bold">
                          Total
                        </p>

                        <p className="font-black text-bg-primary">
                          Rs{" "}
                          {(
                            item.price * item.qty
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* CHECKOUT */}

            <div className="p-4 border-t border-border bg-hover space-y-3">
              {/* CUSTOMER */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) =>
                    setCustomerName(e.target.value)
                  }
                  className="w-full bg-white border text-text border-border rounded-xl px-3 py-3 outline-none focus:ring-2 focus:ring-bg-primary"
                />

             <input
              type="text"
              placeholder="Phone Number (11 digits)"
              value={customerPhone}
              onChange={(e) => {
                const value = e.target.value;
                const onlyNums = value.replace(/[^0-9]/g, '');
                if (onlyNums.length <= 11) {
                  setCustomerPhone(onlyNums);
                }
              }}
              className="w-full bg-white border text-text border-border rounded-xl px-3 py-3 outline-none focus:ring-2 focus:ring-bg-primary"
            />
              </div>

              {/* PAYMENT */}

              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentMethod("cash")}
                  className={`flex-1 py-3 rounded-xl text-text font-bold flex items-center justify-center gap-2 transition-all ${
                    paymentMethod === "cash"
                      ? "bg-gradient-to-r from-bg-primary to-bg-secondary text-white"
                      : "bg-white border border-border"
                  }`}
                >
                  <FiDollarSign />
                  Cash
                </button>

                <button
                  onClick={() => setPaymentMethod("credit")}
                  className={`flex-1 py-3 rounded-xl text-text font-bold flex items-center justify-center gap-2 transition-all ${
                    paymentMethod === "credit"
                      ? "bg-gradient-to-r from-bg-primary to-bg-secondary text-white"
                      : "bg-white border border-border"
                  }`}
                >
                  <FiCreditCard />
                  Credit
                </button>
              </div>

              {/* TOTAL */}

              <div className="bg-white border border-border rounded-2xl p-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold uppercase text-sm">
                    Total Amount
                  </span>

                  <span className="text-2xl font-black text-bg-primary">
                    Rs {totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="flex gap-2">
                <button
                  onClick={saveCart}
                  className="flex-1 py-3 rounded-xl border text-text border-border bg-white font-bold flex items-center justify-center gap-2 hover:bg-hover"
                >
                  <FiSave />
                  Save
                </button>

                <button
                  onClick={completeSale}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-bg-primary to-bg-secondary text-white font-bold hover:scale-[1.02] transition-all"
                >
                  Complete Sale
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pos;