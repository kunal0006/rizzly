"use client";

import { useState } from "react";
import { ArrowLeft, Zap, Star, Shield, Coins } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PricingPage() {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const packs = [
    { id: "pack_50", name: "50 TOKENS", tokens: 50, price: 49, icon: <Coins className="w-6 h-6" /> },
    { id: "pack_150", name: "150 TOKENS", tokens: 150, price: 129, icon: <Coins className="w-6 h-6" />, popular: true },
    { id: "pack_500", name: "500 TOKENS", tokens: 500, price: 349, icon: <Coins className="w-6 h-6" /> },
  ];

  const subscriptions = [
    { id: "sub_scout", name: "SCOUT", tokens: "100/mo", price: 99, icon: <Zap className="w-6 h-6" /> },
    { id: "sub_alpha", name: "ALPHA", tokens: "400/mo", price: 299, icon: <Star className="w-6 h-6" />, popular: true },
    { id: "sub_grizzly", name: "GRIZZLY+", tokens: "1200/mo", price: 699, icon: <Shield className="w-6 h-6" /> },
  ];

  const handleCheckout = async (itemId: string, amountInr: number) => {
    setLoadingId(itemId);
    try {
      // 1. Create Order on Backend
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountInr * 100, receipt: itemId }),
      });
      
      const order = await res.json();
      if (!res.ok) throw new Error(order.error || "Failed to create order");

      // 2. Open Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Rizzly AI",
        description: `Purchase ${itemId}`,
        order_id: order.id,
        handler: async function (response: any) {
          // 3. Verify Signature
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            alert("Payment successful! Tokens added.");
            // Refresh token balance logic here
          } else {
            alert("Payment verification failed: " + verifyData.error);
          }
        },
        theme: { color: "#000000" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert(`Payment Failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-mono pb-20">
      <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      
      <header className="p-4 flex items-center justify-between border-b-4 border-black bg-white sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold hover:bg-black hover:text-white px-2 py-1 transition-colors uppercase">
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </Link>
        <div className="font-bold text-2xl font-pixel uppercase">Item Shop</div>
        <div className="w-24" />
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-12 w-full">
        <div className="text-center mb-16 border-b-4 border-black pb-8">
          <h1 className="text-4xl md:text-6xl font-pixel uppercase mb-4">BUY TOKENS</h1>
          <p className="font-bold text-xl uppercase bg-primary inline-block px-4 py-2 border-2 border-black">1 Analysis = 5 Tokens</p>
        </div>

        <h2 className="text-3xl font-pixel uppercase mb-8 flex items-center gap-4">
          <Zap className="w-8 h-8" /> SUBSCRIPTIONS
        </h2>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {subscriptions.map((sub) => (
            <motion.div 
              key={sub.id}
              whileHover={{ y: -5 }}
              className={`brutal-border brutal-shadow bg-white flex flex-col relative ${sub.popular ? 'ring-4 ring-secondary' : ''}`}
            >
              {sub.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-white font-bold px-4 py-1 brutal-border text-sm uppercase">
                  Most Popular
                </div>
              )}
              <div className="p-6 border-b-4 border-black text-center bg-black text-white">
                <div className="flex justify-center mb-2">{sub.icon}</div>
                <h3 className="text-2xl font-pixel uppercase">{sub.name}</h3>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between items-center bg-accent">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold mb-2">₹{sub.price}</div>
                  <div className="font-bold uppercase text-gray-600">{sub.tokens}</div>
                </div>
                <button 
                  onClick={() => handleCheckout(sub.id, sub.price)}
                  disabled={loadingId === sub.id}
                  className="w-full bg-primary text-black font-bold border-4 border-black py-3 brutal-shadow-sm hover:translate-y-1 transition-transform uppercase disabled:opacity-50"
                >
                  {loadingId === sub.id ? "Loading..." : "Subscribe"}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <h2 className="text-3xl font-pixel uppercase mb-8 flex items-center gap-4">
          <Coins className="w-8 h-8" /> ONE-TIME PACKS
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {packs.map((pack) => (
            <motion.div 
              key={pack.id}
              whileHover={{ y: -5 }}
              className={`brutal-border brutal-shadow bg-white flex flex-col relative ${pack.popular ? 'ring-4 ring-primary' : ''}`}
            >
              {pack.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black font-bold px-4 py-1 brutal-border text-sm uppercase">
                  Best Value
                </div>
              )}
              <div className="p-6 flex flex-col items-center border-b-4 border-black">
                <div className="flex justify-center mb-2">{pack.icon}</div>
                <h3 className="text-xl font-bold uppercase">{pack.name}</h3>
              </div>
              <div className="p-6 bg-white flex flex-col items-center">
                <div className="text-3xl font-pixel mb-6">₹{pack.price}</div>
                <button 
                  onClick={() => handleCheckout(pack.id, pack.price)}
                  disabled={loadingId === pack.id}
                  className="w-full bg-black text-white font-bold border-4 border-black py-3 brutal-shadow-sm hover:bg-gray-800 transition-colors uppercase disabled:opacity-50"
                >
                  {loadingId === pack.id ? "Loading..." : "Buy Now"}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
