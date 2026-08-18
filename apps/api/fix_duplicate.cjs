const { Client } = require('pg');

async function fixDuplicate() {
  const client = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:5432/desasukarama' });
  await client.connect();
  try {
    const res = await client.query("SELECT id FROM umkm_produk WHERE nama_produk = 'Sapu Injuk Tradisional' ORDER BY id DESC LIMIT 1");
    if (res.rows.length > 0) {
      const duplicateId = res.rows[0].id;
      await client.query(`DELETE FROM umkm_produk WHERE id = $1`, [duplicateId]);
      console.log('Berhasil menghapus duplikat Sapu Injuk dengan ID:', duplicateId);
    }
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

fixDuplicate();
