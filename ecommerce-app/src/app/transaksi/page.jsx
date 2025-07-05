'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TransaksiPage() {
  const [transaksi, setTransaksi] = useState([]);
  const [produkList, setProdukList] = useState([]);
  const [produkId, setProdukId] = useState('');
  const [jumlah, setJumlah] = useState('1'); // STRING AGAR KOMPATIBEL DENGAN input value

  useEffect(() => {
    fetchProduk();
    fetchTransaksi();
  }, []);

  const fetchProduk = async () => {
    const { data, error } = await supabase.from('produk').select();
    if (!error) setProdukList(data);
  };

  const fetchTransaksi = async () => {
    const { data, error } = await supabase
      .from('transaksi')
      .select(`*, produk(nama, harga)`)
      .order('tanggal', { ascending: false });

    if (!error) setTransaksi(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const produk = produkList.find((p) => String(p.id) === produkId);
    const jumlahNumber = Number(jumlah);

    if (!produkId || isNaN(jumlahNumber) || jumlahNumber <= 0 || !produk) {
        alert('Produk dan jumlah wajib diisi!');
        return;
      }
    
      if (produk.stok < jumlahNumber) {
        alert('Stok tidak mencukupi!');
        return;
      }
    
      const total_harga = produk.harga * jumlahNumber;
    
      const { error: insertError } = await supabase.from('transaksi').insert([
        {
          produk_id: produk.id,
          jumlah: jumlahNumber,
          total_harga,
          tanggal: new Date().toISOString(),
        },
      ]);
    
      if (insertError) {
        console.error('Gagal menambahkan transaksi:', insertError.message);
        alert('Gagal menambahkan transaksi!');
        return;
      }
    
      // Update stok produk
      await supabase
        .from('produk')
        .update({ stok: produk.stok - jumlahNumber })
        .eq('id', produk.id);
    
      // Reset form
      setProdukId('');
      setJumlah('1');
      fetchTransaksi();
      fetchProduk();
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Halaman Transaksi</h1>

      {/* Form Transaksi */}
      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <select
          className="w-full border p-2 rounded"
          value={produkId}
          onChange={(e) => setProdukId(e.target.value)}
        >
          <option value="">Pilih Produk</option>
          {produkList.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nama} (Rp{p.harga}) — Stok: {p.stok}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Jumlah"
          min={1}
          className="w-full border p-2 rounded"
          value={jumlah}
          onChange={(e) => setJumlah(e.target.value)}
        />

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Simpan Transaksi
        </button>
      </form>

      {/* Daftar Transaksi */}
      <div className="space-y-3">
        {transaksi.length > 0 ? (
          transaksi.map((t) => (
            <div key={t.id} className="border p-3 rounded shadow-sm bg-white">
              <p className="font-semibold">{t.produk?.nama}</p>
              <p className="text-sm text-gray-600">
                Jumlah: {t.jumlah} x Rp{t.produk?.harga}
              </p>
              <p className="text-sm text-gray-500">
                Total: <strong>Rp{t.total_harga}</strong> —{' '}
                {t.tanggal ? new Date(t.tanggal).toLocaleString() : ''}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Belum ada transaksi</p>
        )}
      </div>
    </div>
  );
}
