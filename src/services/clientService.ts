import { ObjectId } from 'mongodb';
import { getCollection, COLLECTIONS } from '@/lib/db';
import { Client, ClientValidationSchema, IClient } from '@/models/Client';

/**
 * Get the active client for a specific group
 * If no client exists for the group, returns null
 * @param {string} groupName - The name of the WhatsApp group
 * @returns {Promise<IClient|null>} - The active client for the group
 */
export async function getActiveClient(groupName: string) {
  try {
    const collection = await getCollection('CLIENTS');
    
    // Try to find a client that matches the group name
    const existingClient = await collection.findOne({ whatsappGroupName: groupName });
    
    if (existingClient) {
      console.log(`Found existing client for group: ${groupName}`);
      return existingClient as IClient;
    } else {
      console.log(`No client found for group: ${groupName}`);
      return null;
    }
  } catch (error) {
    console.error('Error getting active client:', error);
    throw error;
  }
}

/**
 * Create a new client
 * @param {Partial<IClient>} clientData - The client data to save
 * @returns {Promise<IClient>} - The created client document
 * @throws {Error} - If validation fails or database error occurs
 */
export async function createClient(clientData: Partial<IClient>) {
  try {
    // Validate the client data
    const validationResult = ClientValidationSchema.safeParse(clientData);
    if (!validationResult.success) {
      throw new Error(`Client validation failed: ${validationResult.error.errors.map(e => e.message).join(', ')}`);
    }

    const collection = await getCollection('CLIENTS');
    
    const result = await collection.insertOne({
      ...clientData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log(`Client created in MongoDB with ID: ${result.insertedId}`);
    
    return {
      ...clientData,
      _id: result.insertedId,
      createdAt: new Date(),
      updatedAt: new Date()
    } as IClient;
  } catch (error) {
    console.error('Error creating client in MongoDB:', error);
    throw error;
  }
}

/**
 * Get a client by ID
 * @param {string} clientId - The client's ID
 * @returns {Promise<IClient|null>} - The client document if found, null otherwise
 */
export async function getClient(clientId: string) {
  try {
    const collection = await getCollection('CLIENTS');
    const doc = await collection.findOne({ _id: new ObjectId(clientId) });
    return doc as IClient | null;
  } catch (error) {
    console.error('Error getting client from MongoDB:', error);
    throw error;
  }
}

/**
 * Update a client
 * @param {string} clientId - The client's ID
 * @param {Partial<IClient>} updateData - The data to update
 * @returns {Promise<IClient>} - The updated client document
 */
export async function updateClient(clientId: string, updateData: Partial<IClient>) {
  try {
    const collection = await getCollection('CLIENTS');
    
    // Validate the update data
    const validationResult = ClientValidationSchema.partial().safeParse(updateData);
    if (!validationResult.success) {
      throw new Error(`Client validation failed: ${validationResult.error.errors.map(e => e.message).join(', ')}`);
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(clientId) },
      { 
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      throw new Error(`Client not found with ID: ${clientId}`);
    }

    console.log(`Client updated in MongoDB: ${clientId}`);
    return result.value as IClient;
  } catch (error) {
    console.error('Error updating client in MongoDB:', error);
    throw error;
  }
}

/**
 * Delete a client
 * @param {string} clientId - The client's ID
 * @returns {Promise<boolean>} - True if deleted, false if not found
 */
export async function deleteClient(clientId: string) {
  try {
    const collection = await getCollection('CLIENTS');
    const result = await collection.deleteOne({ _id: new ObjectId(clientId) });
    return result.deletedCount > 0;
  } catch (error) {
    console.error('Error deleting client from MongoDB:', error);
    throw error;
  }
}

/**
 * List all clients with pagination and sorting
 * @param {Object} options - Pagination and sorting options
 * @returns {Promise<{clients: IClient[], total: number, page: number, limit: number}>} - The paginated clients
 */
export async function listClients(options: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = {}) {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    const collection = await getCollection('CLIENTS');
    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [clients, total] = await Promise.all([
      collection.find({})
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments()
    ]);

    return {
      clients: clients as IClient[],
      total,
      page,
      limit
    };
  } catch (error) {
    console.error('Error listing clients from MongoDB:', error);
    throw error;
  }
} 