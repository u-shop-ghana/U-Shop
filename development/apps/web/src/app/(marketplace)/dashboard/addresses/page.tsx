export default function AddressesPage() {
  return (
    <div className="w-full max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Address Book</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border p-12 text-center flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-gray-400">home_pin</span>
        </div>
        <h2 className="text-lg font-bold text-gray-900">No addresses saved</h2>
        <p className="text-gray-500 text-sm mt-2 max-w-sm">
          Add your campus hostel or residential address to make checkout faster next time.
        </p>
      </div>
    </div>
  );
}
