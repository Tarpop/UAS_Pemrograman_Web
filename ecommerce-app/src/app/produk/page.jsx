'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ProdukPage() {
  const [produk, setProduk] = useState([]);
  const [nama, setNama] = useState('');
  const [harga, setHarga] = useState('');
  const [stok, setStok] = useState('');
  const [kategoriId, setKategoriId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [editId, setEditId] = useState(null);
  const [kategoriList, setKategoriList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);

  useEffect(() => {
    fetchProduk();
    fetchKategori();
    fetchSupplier();
  }, []);

  const fetchProduk = async () => {
    const { data, error } = await supabase
      .from('produk')
      .select(`*, kategori(id, nama), supplier(id, nama)`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Gagal mengambil produk:', error.message);
    } else {
      setProduk(data);
    }
  };

  const fetchKategori = async () => {
    const { data } = await supabase.from('kategori').select('id, nama');
    setKategoriList(data || []);
  };

  const fetchSupplier = async () => {
    const { data } = await supabase.from('supplier').select('id, nama');
    setSupplierList(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nama || !harga || !stok || !kategoriId || !supplierId) {
      alert('Semua field wajib diisi!');
      return;
    }

    if (editId) {
      const { error } = await supabase
        .from('produk')
        .update({
          nama,
          harga: Number(harga),
          stok: Number(stok),
          kategori_id: kategoriId,
          supplier_id: supplierId,
        })
        .eq('id', editId);

      if (error) {
        alert('Gagal update produk');
        return;
      }
    } else {
      const { error } = await supabase.from('produk').insert({
        nama,
        harga: Number(harga),
        stok: Number(stok),
        kategori_id: kategoriId,
        supplier_id: supplierId,
      });

      if (error) {
        alert('Gagal menambahkan produk');
        return;
      }
    }

    // Reset form
    setEditId(null);
    setNama('');
    setHarga('');
    setStok('');
    setKategoriId('');
    setSupplierId('');
    fetchProduk();
  };

  const handleEdit = (p) => {
    setEditId(p.id);
    setNama(p.nama);
    setHarga(p.harga);
    setStok(p.stok);
    setKategoriId(p.kategori_id);
    setSupplierId(p.supplier_id);
  };

  const handleDeleteProduk = async (id) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;
    const { error } = await supabase.from('produk').delete().eq('id', id);
    if (!error) fetchProduk();
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Halaman Produk</h1>

      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <input
          type="text"
          placeholder="Nama Produk"
          className="w-full border p-2 rounded"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
        />
        <input
          type="number"
          placeholder="Harga"
          className="w-full border p-2 rounded"
          value={harga}
          onChange={(e) => setHarga(e.target.value)}
        />
        <input
          type="number"
          placeholder="Stok"
          className="w-full border p-2 rounded"
          value={stok}
          onChange={(e) => setStok(e.target.value)}
        />
        <select
          className="w-full border p-2 rounded"
          value={kategoriId}
          onChange={(e) => setKategoriId(e.target.value)}
        >
          <option value="">Pilih Kategori</option>
          {kategoriList.map((k) => (
            <option key={k.id} value={k.id}>
              {k.nama}
            </option>
          ))}
        </select>
        <select
          className="w-full border p-2 rounded"
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
        >
          <option value="">Pilih Supplier</option>
          {supplierList.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nama}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className={`${
            editId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'
          } text-white px-4 py-2 rounded`}
        >
          {editId ? 'Update' : 'Simpan'}
        </button>
      </form>

      <div className="space-y-3">
        {produk.map((p) => (
          <div
            key={p.id}
            className="border p-3 rounded shadow-sm flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{p.nama}</p>
              <p className="text-sm text-gray-600">
                Harga: Rp{p.harga} — Stok: {p.stok}
              </p>
              <p className="text-sm text-gray-500">
                Kategori: {p.kategori?.nama || '-'} | Supplier: {p.supplier?.nama || '-'}
              </p>
            </div>
            <div className="space-x-2">
              <button
                className="text-blue-600 hover:underline"
                onClick={() => handleEdit(p)}
              >
                Edit
              </button>
              <button
                className="text-red-600 hover:underline"
                onClick={() => handleDeleteProduk(p.id)}
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
