const { Client } = require('pg');

async function updateDB() {
  const client = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:5432/desasukarama' });
  await client.connect();
  try {
    // Update Sapu Injuk
    await client.query(`UPDATE umkm_produk SET no_wa_pemilik = '6283817916016' WHERE nama_produk = 'Sapu Injuk Tradisional'`);

    // Insert Kukumbul
    await client.query(`
      INSERT INTO umkm_produk (nama_produk, harga, kategori, deskripsi, pemilik, no_wa_pemilik '6281573276932', foto_path)
      VALUES ('Kukumbul Pancing', 5000, 'Kerajinan', 'Kukumbul pancing buatan tangan asli warga Sukarama. Sangat sensitif dan berkualitas tinggi, cocok untuk memancing di danau atau sungai.', 'Perajin Kukumbul', '6281573276932', '/images/products/kukumbul.jpg')
    `);

    // Insert doran pacul
    await client.query(`
      INSERT INTO umkm_produk (nama_produk, harga, kategori, deskripsi, pemilik, no_wa_pemilik = '6285943097900', foto_path)
      VALUES ('Doran Pacul (Gagang Cangkul)', 35000, 'Kerajinan', 'Doran pacul atau gagang cangkul yang terbuat dari kayu pilihan yang kuat dan tahan lama. Hasil karya asli perajin kayu Desa Sukarama.', 'Perajin Kayu', '', '/images/products/doran-pacul.jpg')
    `);

    console.log('Berhasil mengupdate dan menambah produk UMKM baru!');
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

updateDB();
