// components/SiswaCard.js
export default function SiswaCard({ siswa, onClick, onEdit, onDelete }) {
  return (
    <div className="border rounded p-4 shadow flex justify-between items-center">
      <div onClick={onClick} className="cursor-pointer">
        <h2 className="text-lg font-semibold">{siswa.nama}</h2>
        <p className="text-sm text-gray-600">Kelas: {siswa.kelas}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
        >
          ✏️ Edit
        </button>
        <button
          onClick={onDelete}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
        >
          🗑️ Hapus
        </button>
      </div>
    </div>
  );
}
