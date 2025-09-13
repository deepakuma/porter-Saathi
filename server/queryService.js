export async function saveQuery(collection, query, vector) {
  const doc = { query, vector, createdAt: new Date() };
  await collection.insertOne(doc);
  return doc._id;
}
