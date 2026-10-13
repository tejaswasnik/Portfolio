const dns = require('dns');
dns.setServers(['8.8.8.8','8.8.4.4']);
const { MongoClient } = require('mongodb');
(async () => {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('portfolio_audit');
  await db.collection('projects').insertOne({
    name: 'Audit Sitemap Test', slug: 'audit-sitemap-test-perf',
    published: true, featured: false, order: 998, status: 'ongoing',
    techIds: [], screenshots: [],
  });
  console.log('inserted published=true');
  await client.close();
})();
