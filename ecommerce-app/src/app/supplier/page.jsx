'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SupplierPage() {
  const [supplier, setSupplier] = useState([]);
  const [nama, setNama] = useState('');
  const [kontak, setKontak] = useState('');
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchSupplier();
  }, []);

  const fetchSupplier = async () => {
    const { data, error } = await supabase
      .from('supplier')
      .select()
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Gagal fetch supplier:', error.message);
      alert('Gagal mengambil data supplier.');
    } else {
      setSupplier(data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nama.trim()) {
      alert('Nama supplier wajib diisi!');
      return;
    }

    if (editId) {
      const { error } = await supabase
        .from('supplier')
        .update({ nama, kontak })
        .eq('id', editId);

      if (error) {
        console.error('Gagal update supplier:', error.message);
        alert('Gagal mengupdate supplier.');
        return;
      }
    } else {
      const { error } = await supabase.from('supplier').insert({ nama, kontak });

      if (error) {
        console.error('Gagal insert supplier:', error.message);
        alert('Gagal menambahkan supplier.');
        return;
      }
    }

    setNama('');
    setKontak('');
    setEditId(null);
    fetchSupplier();
  };

  const handleEdit = (item) => {
    setNama(item.nama);
    setKontak(item.kontak || '');
    setEditId(item.id);
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus supplier ini?')) {
      const { error } = await supabase.from('supplier').delete().eq('id', id);
      if (error) {
        console.error('Gagal hapus supplier:', error.message);
        alert('Gagal menghapus supplier.');
      } else {
        fetchSupplier();
      }
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Halaman Supplier</h1>

      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <input
          type="text"
          placeholder="Nama Supplier"
          className="w-full border p-2 rounded"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
        />
        <input
          type="text"
          placeholder="Kontak"
          className="w-full border p-2 rounded"
          value={kontak}
          onChange={(e) => setKontak(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {editId ? 'Update' : 'Tambah'}
        </button>
      </form>

      <div className="space-y-2">
        {supplier.length > 0 ? (
          supplier.map((item) => (
            <div
              key={item.id}
              className="border px-4 py-2 rounded flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{item.nama}</p>
                <p className="text-sm text-gray-500">Kontak: {item.kontak || '-'}</p>
              </div>
              <div className="space-x-2">
                <button onClick={() => handleEdit(item)} className="text-blue-600">
                  Edit
                </button>
                <button onClick={() => handleDelete(item.id)} className="text-red-600">
                  Hapus
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Belum ada supplier.</p>
        )}
      </div>
    </div>
  );
}
