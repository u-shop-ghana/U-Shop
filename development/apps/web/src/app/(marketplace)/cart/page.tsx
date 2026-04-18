import { Metadata } from "next";
import { CartView } from "./CartView";

export const metadata: Metadata = {
  title: "Shopping Cart | U-Shop",
  description: "Review items in your cart before checkout.",
};

export default function CartPage() {
  return (
    <main className="min-h-screen bg-gray-50 pt-10 pb-16">
      <CartView />
    </main>
  );
}
