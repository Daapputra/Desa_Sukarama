const { Client } = require('pg');

async function createDb() {
  const client = new Client({
    connectionString: 'postgresql://postgres:ifunggul@127.0.0.1:22060/postgres'
  });
  
  try {
    await client.connect();
    await client.query('CREATE DATABASE desa_sukarama');
    console.log('Database desa_sukarama created successfully');
  } catch (err) {
    if (err.code === '42P04') {
      console.log('Database desa_sukarama already exists');
    } else {
      console.error('Error:', err.message);
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

createDb();
