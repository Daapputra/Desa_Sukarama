const { Client } = require('pg');
async function fixWa() {
  const client = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:5432/desasukarama' });
  await client.connect();
  await client.query(`UPDATE umkm_produk SET no_wa_pemilik = '6285943097900' WHERE nama_produk = 'Doran Pacul (Gagang Cangkul)'`);
  console.log('Berhasil update WA');
  await client.end();
}
fixWa();
