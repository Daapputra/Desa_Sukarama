const { Client } = require('pg');

async function fixDB() {
  const client = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:5432/desasukarama' });
  await client.connect();
  try {
    const res = await client.query(`UPDATE penduduk SET nik = LTRIM(nik, ''''), no_kk = LTRIM(no_kk, '''')`);
    console.log('Rows updated:', res.rowCount);
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

fixDB();
