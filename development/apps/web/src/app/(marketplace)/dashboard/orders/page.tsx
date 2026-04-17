export default function OrdersPage() {
  return (
    <div className="w-full max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border p-12 text-center flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-gray-400">inventory_2</span>
        </div>
        <h2 className="text-lg font-bold text-gray-900">No orders yet</h2>
        <p className="text-gray-500 text-sm mt-2 max-w-sm">
          When you purchase items from student sellers, you&apos;ll be able to track their status here.
        </p>
      </div>
    </div>
  );
}
