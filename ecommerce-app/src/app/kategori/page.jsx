'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function KategoriPage() {
  const [kategori, setKategori] = useState([]);
  const [nama, setNama] = useState('');
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchKategori();
  }, []);

  const fetchKategori = async () => {
    const { data, error } = await supabase
      .from('kategori')
      .select()
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Gagal mengambil kategori:', error.message);
      alert('Gagal mengambil data kategori.');
    } else {
      setKategori(data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nama.trim()) {
      alert('Nama kategori wajib diisi!');
      return;
    }

    if (editId) {
      const { error } = await supabase
        .from('kategori')
        .update({ nama })
        .eq('id', editId);

      if (error) {
        console.error('Gagal update kategori:', error.message);
        alert('Gagal mengupdate kategori.');
        return;
      }
    } else {
      const { error } = await supabase.from('kategori').insert({ nama });

      if (error) {
        console.error('Gagal insert kategori:', error.message);
        alert('Gagal menambahkan kategori.');
        return;
      }
    }

    setNama('');
    setEditId(null);
    fetchKategori();
  };

  const handleEdit = (item) => {
    setNama(item.nama);
    setEditId(item.id);
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus kategori ini?')) {
      const { error } = await supabase.from('kategori').delete().eq('id', id);
      if (error) {
        console.error('Gagal hapus kategori:', error.message);
        alert('Gagal menghapus kategori.');
      } else {
        fetchKategori();
      }
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Halaman Kategori</h1>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Nama Kategori"
          className="border px-3 py-2 rounded w-full"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
          {editId ? 'Update' : 'Tambah'}
        </button>
      </form>

      <ul className="space-y-2">
        {kategori.length > 0 ? (
          kategori.map((item) => (
            <li
              key={item.id}
              className="border p-3 rounded flex justify-between items-center"
            >
              <span>{item.nama}</span>
              <div className="space-x-2">
                <button className="text-blue-600" onClick={() => handleEdit(item)}>
                  Edit
                </button>
                <button className="text-red-600" onClick={() => handleDelete(item.id)}>
                  Hapus
                </button>
              </div>
            </li>
          ))
        ) : (
          <p className="text-gray-500">Belum ada kategori.</p>
        )}
      </ul>
    </div>
  );
}
