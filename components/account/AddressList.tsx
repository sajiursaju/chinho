// components/account/AddressList.tsx
export default function AddressList() {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Saved Addresses</h3>
        <p className="text-sm text-gray-400">
          No saved addresses yet. Addresses will appear here after your first
          order.
        </p>
      </div>
    );
  }