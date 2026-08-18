const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:5432/desasukarama' });
client.connect().then(() => 
  client.query("INSERT INTO umkm_produk (nama_produk, harga, kategori, deskripsi, pemilik, no_wa_pemilik, foto_path) VALUES ('Sapu Injuk Tradisional', 25000, 'Kerajinan', 'Sapu injuk buatan tangan asli warga Desa Sukarama. Dibuat dengan rapi, sangat kuat, awet, dan nyaman digunakan untuk membersihkan rumah atau halaman.', 'Bapak (Perajin Injuk)', '6281234560000', '/images/products/sapu-injuk.jpg')")
).then(res => { 
  console.log('Berhasil menambahkan UMKM Sapu Injuk'); 
  client.end(); 
}).catch(e => { 
  console.error(e); 
  client.end(); 
});
