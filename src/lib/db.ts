import { MongoClient } from 'mongodb';

// Collection names
export const COLLECTIONS = {
  SERVICE_CALLS: 'serviceCalls',
  CLIENTS: 'clients'
} as const;

// MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/client-management';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

// MongoDB native client caching
let mongoClient: MongoClient | null = null;
let mongoDb: any = null;

// MongoDB native client connection function
export async function connectToMongoDB() {
  try {
    if (!mongoClient) {
      console.log('Connecting to MongoDB...');
      mongoClient = new MongoClient(MONGODB_URI);
      await mongoClient.connect();
      mongoDb = mongoClient.db('whatsapp_bot');
      console.log('Connected to MongoDB successfully');
    }
    return mongoDb;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Close MongoDB native client connection
export async function closeMongoDB() {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
    mongoDb = null;
    console.log('MongoDB connection closed');
  }
}

// Helper function to get the native MongoDB collection
export async function getCollection(collectionName: keyof typeof COLLECTIONS) {
  const db = await connectToMongoDB();
  return db.collection(COLLECTIONS[collectionName]);
} 