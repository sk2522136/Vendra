import React, { useState, useEffect } from 'react';
import { FiSearch, FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiCreditCard, FiDollarSign, FiFilter, FiSave, FiPrinter, FiX } from "react-icons/fi";
import { fetchProduct, createSale, getAllCategories } from '../services/api.js';
import { toast } from 'react-toastify';

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
      console.error("Failed to load categories:", error);
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
    const saved = localStorage.getItem('savedCarts');
    if (saved) {
      setSavedCarts(JSON.parse(saved));
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product, customPrice = null) => {
    if (!product.quantity || product.quantity <= 0) {
      toast.error("Product out of stock!");
      return;
    }

    const sellPrice = customPrice || productPrices[product._id] || product.costPrice;
    const existingItem = cart.find(item => item.productId === product._id);

    if (existingItem) {
      if (existingItem.qty >= product.quantity) {
        toast.error(`Only ${product.quantity} items available!`);
        return;
      }
      setCart(cart.map(item =>
        item.productId === product._id
          ? { ...item, qty: item.qty + 1, price: sellPrice }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product._id,
        name: product.name,
        price: sellPrice,
        qty: 1
      }]);
    }
  };

  const increaseQty = (productId) => {
    const product = products.find(p => p._id === productId);

    setCart(prevCart =>
      prevCart.map(item => {
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
    setCart(cart.map(item =>
      item.productId === productId && item.qty > 1
        ? { ...item, qty: item.qty - 1 }
        : item
    ).filter(item => item.qty > 0));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
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
      subtotal
    };

    const updated = [...savedCarts, newCart];
    setSavedCarts(updated);
    localStorage.setItem('savedCarts', JSON.stringify(updated));
    toast.success("Cart saved successfully!");
  };

  const loadSavedCart = (savedCart) => {
    setCart(savedCart.items);
    toast.success("Cart loaded!");
  };

  const deleteSavedCart = (id) => {
    const updated = savedCarts.filter(c => c.id !== id);
    setSavedCarts(updated);
    localStorage.setItem('savedCarts', JSON.stringify(updated));
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
        items: cart.map(item => ({
          product: item.productId,
          quantity: item.qty,
          sellPrice: item.price
        })),
        customerType: paymentMethod,
        paidAmount: paymentMethod === 'cash' ? totalAmount : 0
      };

      const response = await createSale(saleData);

      toast.success("Sale complete!");

      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setPaymentMethod("cash");

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to complete sale");
    }
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="flex flex-col h-screen sm:h-[98vh] p-2 sm:p-3 md:p-4 lg:p-6 rounded-2xl sm:rounded-3xl bg-gray-100 overflow-y-auto custom-scrollbar lg:overflow-hidden">

      {/* HEADER */}
      <div className="mb-4 sm:mb-5 md:mb-6 pl-1 sm:pl-2 shrink-0">
        <h1 className="text-2xl sm:text-2.5xl md:text-3xl lg:text-4xl font-black text-black uppercase tracking-tight">Point of Sale</h1>
        <p className="text-gray-500 text-xs sm:text-sm font-medium mt-1">Process transactions with quick saved carts and receipt printing.</p>
      </div>

      {/* MAIN CONTAINER */}
      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 md:gap-5 lg:gap-6 flex-1 overflow-hidden min-h-0">

        {/* LEFT PANE - PRODUCTS */}
        <div className="flex-1 w-full min-h-[45vh] sm:min-h-[50vh] lg:h-full flex flex-col bg-white border border-gray-100 rounded-2xl sm:rounded-2.5xl lg:rounded-3xl p-2 sm:p-3 md:p-4 lg:p-5 overflow-hidden shadow-sm">

          {/* SEARCH & FILTER */}
          <div className="flex flex-col sm:flex-row gap-2 mb-3 sm:mb-4 shrink-0">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border text-black border-gray-100 rounded-xl sm:rounded-2xl pl-9 pr-3 py-2 sm:py-2.5 lg:py-3 focus:outline-none shadow-sm focus:border-black transition-all text-xs sm:text-sm"
              />
            </div>

            <div className="relative w-full sm:w-40 lg:w-48">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={14} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-white text-black border border-gray-100 rounded-xl sm:rounded-2xl pl-8 pr-2 py-2 sm:py-2.5 lg:py-3 appearance-none focus:outline-none font-bold text-xs sm:text-sm cursor-pointer shadow-sm"
              >
                <option value="All">All</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PRODUCTS GRID */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
              {filteredProducts.map(p => (
                <div
                  key={p._id}
                  className="bg-white border border-gray-100 rounded-xl sm:rounded-2xl p-2 sm:p-3 cursor-pointer group active:scale-95 hover:border-black hover:shadow-md transition-all relative overflow-hidden"
                >
                  {/* PRODUCT IMAGE */}
                  <div className="h-20 sm:h-24 md:h-28 bg-gray-50 rounded-lg sm:rounded-xl mb-2 flex items-center justify-center border border-gray-100 relative">
                    <img
                      src={p.image?.url || "placeholder"}
                      alt={p.name}
                      className="w-full rounded-lg h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {/* PRODUCT NAME */}
                  <h4 className="font-bold text-black truncate text-xs sm:text-sm uppercase tracking-tight mb-1">{p.name}</h4>

                  {/* PRICE & ADD BUTTON */}
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-black font-black text-xs sm:text-sm">Rs {productPrices[p._id] || p.costPrice}</span>
                    <button
                      onClick={() => addToCart(p, productPrices[p._id])}
                      className={`w-6 h-6 sm:w-7 lg:w-8 lg:h-8 ${p.quantity > 0 ? 'bg-black' : 'bg-gray-300'} text-white rounded-lg flex items-center justify-center hover:bg-black shadow-sm transition-all`}
                    >
                      <FiPlus size={14} />
                    </button>
                  </div>

                  {/* OUT OF STOCK BADGE */}
                  {p.quantity === 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                      Out
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANE - CART */}
        <div className="w-full lg:w-96 min-h-[35vh] sm:min-h-[40vh] lg:h-full flex flex-col shrink-0">
          <div className="flex flex-col h-full bg-white border border-gray-100 rounded-2xl sm:rounded-2.5xl lg:rounded-3xl shadow-sm overflow-hidden">

            {/* CART HEADER */}
            <div className="p-2 sm:p-3 md:p-4 lg:p-5 border-b border-gray-100 flex items-center gap-2 bg-gray-50 shrink-0">
              <div className="p-1.5 sm:p-2 bg-black rounded-lg sm:rounded-xl shadow-lg">
                <FiShoppingCart className="text-white" size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-black text-black text-xs sm:text-sm uppercase tracking-tighter">Cart</h2>
                <p className="text-xs sm:text-sm text-gray-500 font-bold">{cart.length} Items</p>
              </div>
            </div>

            {/* SAVED CARTS */}
            {savedCarts.length > 0 && (
              <div className="p-2 sm:p-3 border-b border-gray-100 max-h-20 sm:max-h-24 overflow-y-auto">
                <p className="text-xs font-black text-gray-600 mb-2">SAVED CARTS</p>
                <div className="flex gap-2 overflow-x-auto">
                  {savedCarts.map(sc => (
                    <div key={sc.id} className="flex-shrink-0 bg-gray-50 p-2 rounded-lg border border-gray-200 text-center min-w-max">
                      <p className="text-xs font-bold text-black truncate">{sc.name}</p>
                      <p className="text-xs text-gray-600">{sc.items.length} items</p>
                      <div className="flex gap-1 mt-1">
                        <button
                          onClick={() => loadSavedCart(sc)}
                          className="flex-1 text-xs bg-black text-white py-1 px-2 rounded hover:opacity-80"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deleteSavedCart(sc.id)}
                          className="flex-1 text-xs bg-red-500 text-white py-1 px-2 rounded hover:opacity-80"
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
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 sm:p-3 md:p-4 lg:p-5 space-y-2 sm:space-y-3">
              {cart.length === 0 ? (
                <p className="text-center text-gray-400 text-sm">Cart khali hai</p>
              ) : (
                cart.map(item => (
                  <div key={item.productId} className="flex flex-col gap-2 bg-gray-50 p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-gray-100">
                    {/* ITEM HEADER */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <h5 className="text-black text-xs sm:text-sm font-black truncate uppercase">{item.name}</h5>
                        {item.costPrice && (
                          <p className="text-black font-bold text-xs">Cost: Rs {item.costPrice}</p>
                        )}
                      </div>

                      {/* QTY CONTROLS */}
                      <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1">
                        <button
                          className="p-0.5 text-black hover:text-red-500"
                          onClick={() => decreaseQty(item.productId)}
                        >
                          <FiMinus size={12} />
                        </button>
                        <span className="text-black font-black text-xs w-4 text-center">{item.qty}</span>
                        <button
                          className="p-0.5 text-black"
                          onClick={() => increaseQty(item.productId)}
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>

                      {/* DELETE BUTTON */}
                      <button
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>

                    {/* SELL PRICE INPUT */}
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="text-xs font-bold text-gray-600">Sell Price</label>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => {
                            const newPrice = parseFloat(e.target.value) || item.price;
                            setCart(cart.map(cartItem =>
                              cartItem.productId === item.productId
                                ? { ...cartItem, price: newPrice }
                                : cartItem
                            ));
                          }}
                          className="w-full px-2 py-1 text-xs bg-white border text-black border-gray-200 rounded outline-none focus:border-black"
                        />
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Total</p>
                        <p className="text-sm sm:text-base font-black text-black">Rs {(item.price * item.qty).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* CHECKOUT SECTION */}
            <div className="p-2 sm:p-3 md:p-4 lg:p-6 border-t border-gray-100 bg-white space-y-2 sm:space-y-3 shrink-0">
              {/* CUSTOMER DETAILS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-black rounded-lg px-3 py-2 text-xs sm:text-sm outline-none focus:border-black"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-black rounded-lg px-3 py-2 text-xs sm:text-sm outline-none focus:border-black"
                />
              </div>

              {/* PAYMENT METHOD */}
              <div className="flex gap-2">
                <button
                  className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-black uppercase flex items-center justify-center gap-1 transition-all ${
                    paymentMethod === 'cash'
                      ? 'bg-black text-white'
                      : 'border border-gray-200 bg-gray-50 text-black hover:border-black'
                  }`}
                  onClick={() => setPaymentMethod('cash')}
                >
                  <FiDollarSign size={14} /> Cash
                </button>
                <button
                  className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-black uppercase flex items-center justify-center gap-1 transition-all ${
                    paymentMethod === 'credit'
                      ? 'bg-black text-white'
                      : 'border border-gray-200 bg-gray-50 text-black hover:border-black'
                  }`}
                  onClick={() => setPaymentMethod('credit')}
                >
                  <FiCreditCard size={14} /> Credit
                </button>
              </div>

              {/* TOTAL */}
              <div className="bg-gray-50 p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border border-gray-200">
                <div className="flex justify-between items-center text-black">
                  <span className="font-black text-xs sm:text-sm uppercase">Total</span>
                  <span className="text-xl sm:text-2xl md:text-3xl font-black text-black">Rs {totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-2">
                <button
                  onClick={saveCart}
                  className="flex-1 bg-gray-100 text-black py-2 rounded-lg text-xs sm:text-sm font-black uppercase flex items-center justify-center gap-1 hover:bg-gray-200 transition-all"
                >
                  <FiSave size={14} /> Save
                </button>
                <button
                  onClick={completeSale}
                  className="flex-1 bg-black text-white py-2 rounded-lg text-xs sm:text-sm font-black uppercase hover:opacity-90 transition-all"
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