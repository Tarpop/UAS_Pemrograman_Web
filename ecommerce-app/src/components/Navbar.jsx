import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="bg-gray-800 text-white p-4 flex gap-4">
            <Link href="/kategori">Kategori</Link>
            <Link href="/produk">Produk</Link>
            <Link href="/supplier">Supplier</Link>
            <Link href="/transaksi">Transaksi</Link>
        </nav>
    );
}