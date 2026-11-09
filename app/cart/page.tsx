"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";

type CheckoutSettings = {
  freeShippingThreshold: number;
  dhakaDeliveryCharge: number;
  outsideDhakaDeliveryCharge: number;
  enableCod: boolean;
  enableBkash: boolean;
  enableNagad: boolean;
  codInstruction: string;
  bkashNumber: string;
  bkashAction: "Send Money" | "Cash Out";
  bkashInstruction: string;
  nagadNumber: string;
  nagadAction: "Send Money" | "Cash Out";
  nagadInstruction: string;
};

const emptySettings: CheckoutSettings = {
  freeShippingThreshold: 2000,
  dhakaDeliveryCharge: 60,
  outsideDhakaDeliveryCharge: 120,
  enableCod: true,
  enableBkash: false,
  enableNagad: false,
  codInstruction: "Pay the delivery person when your order arrives.",
  bkashNumber: "",
  bkashAction: "Send Money",
  bkashInstruction: "",
  nagadNumber: "",
  nagadAction: "Send Money",
  nagadInstruction: "",
};

const taka = (value: number) => `৳${Number(value).toFixed(2)}`;

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const router = useRouter();
  const [settings, setSettings] = useState<CheckoutSettings>(emptySettings);
  const [settingsReady, setSettingsReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [deliveryArea, setDeliveryArea] = useState<"dhaka" | "outside_dhaka">("dhaka");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  useEffect(() => {
    let ignore = false;
    fetch("/api/checkout/settings", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load checkout settings");
        return response.json();
      })
      .then((data) => {
        if (!ignore) {
          setSettings(data);
          setPaymentMethod(data.enableCod ? "cod" : data.enableBkash ? "bkash" : "nagad");
          setSettingsReady(true);
        }
      })
      .catch(() => {
        if (!ignore) {
          setError("Could not load checkout options. Please refresh the page.");
          setSettingsReady(true);
        }
      });
    return () => { ignore = true; };
  }, []);

  const deliveryCharge = useMemo(() => {
    if (settings.freeShippingThreshold > 0 && totalPrice >= settings.freeShippingThreshold) return 0;
    return deliveryArea === "dhaka" ? settings.dhakaDeliveryCharge : settings.outsideDhakaDeliveryCharge;
  }, [deliveryArea, settings, totalPrice]);
  const total = totalPrice + deliveryCharge;

  async function handleCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          deliveryArea,
          paymentMethod,
          customerName,
          customerPhone,
          customerAddress,
          paymentReference,
          paymentNote,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) throw new Error(data.error || "Could not place order");
      clearCart();
      setOrderId(data.orderId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (orderId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-4 text-2xl font-bold">Thank you!</h1>
        <p className="mb-4 text-gray-600">Your order #{orderId} has been placed.</p>
        <p className="mb-4 text-gray-600">You can follow its progress on <Link href="/orders" className="font-medium underline">My Orders</Link>.</p>
        <Link href="/" className="underline">Continue shopping</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return <div className="mx-auto max-w-3xl px-4 py-10"><h1 className="mb-4 text-2xl font-bold">Your cart</h1><p className="mb-4 text-gray-600">Your cart is empty.</p><Link href="/" className="underline">Continue shopping</Link></div>;
  }

  const selectedWallet = paymentMethod === "bkash"
    ? { name: "bKash", number: settings.bkashNumber, action: settings.bkashAction, instruction: settings.bkashInstruction }
    : paymentMethod === "nagad"
      ? { name: "Nagad", number: settings.nagadNumber, action: settings.nagadAction, instruction: settings.nagadInstruction }
      : null;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <form onSubmit={handleCheckout} className="space-y-6">
          <section className="rounded-xl border bg-white p-5">
            <h2 className="mb-4 text-lg font-semibold">Delivery details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">Full name<input required maxLength={100} value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 font-normal" /></label>
              <label className="text-sm font-medium">Phone number<input required maxLength={30} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 font-normal" /></label>
              <label className="text-sm font-medium sm:col-span-2">Delivery address<textarea required maxLength={1000} value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} rows={3} className="mt-1 w-full rounded border px-3 py-2 font-normal" /></label>
              <label className="text-sm font-medium sm:col-span-2">Delivery area<select value={deliveryArea} onChange={(e) => setDeliveryArea(e.target.value as "dhaka" | "outside_dhaka")} className="mt-1 w-full rounded border px-3 py-2 font-normal"><option value="dhaka">Dhaka</option><option value="outside_dhaka">Outside Dhaka</option></select></label>
            </div>
          </section>

          <section className="rounded-xl border bg-white p-5">
            <h2 className="mb-4 text-lg font-semibold">Payment method</h2>
            {!settingsReady ? <p className="text-sm text-gray-500">Loading payment options…</p> : (
              <div className="space-y-3">
                {settings.enableCod && <label className="flex cursor-pointer gap-3 rounded-lg border p-3"><input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} /><span><b>Cash on Delivery</b><span className="block text-sm text-gray-600">{settings.codInstruction}</span></span></label>}
                {settings.enableBkash && <label className="flex cursor-pointer gap-3 rounded-lg border p-3"><input type="radio" name="payment" value="bkash" checked={paymentMethod === "bkash"} onChange={() => setPaymentMethod("bkash")} /><span><b>bKash</b></span></label>}
                {settings.enableNagad && <label className="flex cursor-pointer gap-3 rounded-lg border p-3"><input type="radio" name="payment" value="nagad" checked={paymentMethod === "nagad"} onChange={() => setPaymentMethod("nagad")} /><span><b>Nagad</b></span></label>}
                {!settings.enableCod && !settings.enableBkash && !settings.enableNagad && <p className="text-sm text-red-600">No payment methods are currently available. Contact the store.</p>}
              </div>
            )}

            {selectedWallet && (
              <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-gray-800">
                <p className="font-semibold">{selectedWallet.name}: {selectedWallet.action}</p>
                <p className="mt-1">Send the total amount {taka(total)} to <strong>{selectedWallet.number || "Payment number not configured"}</strong>.</p>
                {selectedWallet.instruction && <p className="mt-2">{selectedWallet.instruction}</p>}
                <label className="mt-3 block font-medium">Transaction ID / reference<input required maxLength={120} value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} className="mt-1 w-full rounded border bg-white px-3 py-2 font-normal" /></label>
                <label className="mt-3 block font-medium">Sender number (optional)<input maxLength={30} value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} className="mt-1 w-full rounded border bg-white px-3 py-2 font-normal" /></label>
                <p className="mt-2 text-xs text-gray-600">Payment is pending until the store verifies the transaction.</p>
              </div>
            )}
          </section>
          {error && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={loading || !settingsReady || (!settings.enableCod && !settings.enableBkash && !settings.enableNagad)} className="w-full rounded bg-gray-900 px-6 py-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-50">{loading ? "Placing order…" : "Confirm order"}</button>
        </form>

        <aside className="h-fit rounded-xl border bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold">Order summary</h2>
          <ul className="divide-y text-sm">{items.map((item) => <li key={item.id} className="flex justify-between gap-3 py-3"><span>{item.name} × {item.quantity}</span><span>{taka(item.price * item.quantity)}</span></li>)}</ul>
          <div className="space-y-2 border-t pt-4 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{taka(totalPrice)}</span></div><div className="flex justify-between"><span>Delivery ({deliveryArea === "dhaka" ? "Dhaka" : "Outside Dhaka"})</span><span>{deliveryCharge === 0 ? "Free" : taka(deliveryCharge)}</span></div>{settings.freeShippingThreshold > 0 && <p className="text-xs text-gray-500">Free delivery on orders of {taka(settings.freeShippingThreshold)} or more.</p>}<div className="flex justify-between border-t pt-3 text-base font-bold"><span>Total</span><span>{taka(total)}</span></div></div>
        </aside>
      </div>
    </main>
  );
}
