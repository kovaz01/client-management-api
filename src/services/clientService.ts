import { ObjectId } from 'mongodb';
import { getCollection, COLLECTIONS } from '@/lib/db';
import { ClientValidationSchema, IClient } from '@/models/Client';

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

/**
 * Fetch client data from external API based on phone number
 * @param {string} phoneNumber - The phone number to search for
 * @returns {Promise<Partial<IClient>>} - The client data from external API
 */
export async function fetchClientDataFromExternalAPI(phoneNumber: string) {
  try {
    // Step 1: Login with phone number
    const loginResponse = await fetch("https://api.apoint.co.il/BuildApp/Login/EzhGlobalTenantLogin", {
      method: "POST",
      headers: {
        "accept": "*/*",
        "content-type": "application/json"
      },
      body: JSON.stringify([
        {
          paramName: "mobile",
          paramValue: phoneNumber,
          paramType: 22
        }
      ])
    });

    if (!loginResponse.ok) {
      throw new Error(`Failed to login with phone number. Status: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log("Login response:", loginData);

    const loginParsed = loginData.APIResponseText
      ? JSON.parse(loginData.APIResponseText)
      : null;

    if (!loginParsed || !loginParsed.Table || loginParsed.Table.length === 0) {
      throw new Error("No login data found in login response");
    }

    const loginInfo = loginParsed.Table[0];

    // Step 2: Authenticate using returned credentials
    const authResponse = await fetch("https://api.apoint.co.il/dbActions/Login/Auth", {
      method: "POST",
      headers: {
        accept: "*/*",
        "content-type": "application/json"
      },
      body: JSON.stringify([
        { paramName: "CompID", paramValue: loginInfo.compGuid, paramType: 16 },
        { paramName: "UserName", paramValue: loginInfo.compGuid, paramType: 8 },
        { paramName: "UserPswd", paramValue: loginInfo.webPswd, paramType: 8 },
        { paramName: "AppGuid", paramValue: "77C8F2FD-B1DE-4CEA-BE74-FD943B3BD54D", paramType: 8 }
      ])
    });

    if (!authResponse.ok) {
      throw new Error(`Failed to authenticate. Status: ${authResponse.status}`);
    }

    const authData = await authResponse.json();
    console.log("Authentication response:", authData);

    const sessionToken = authData.APIResponseText
      ? JSON.parse(authData.APIResponseText).sessionToken
      : null;

    if (!sessionToken) {
      throw new Error("No session token received");
    }


    return {
      bid: parseInt(loginInfo.bid) || 0,
      uid: parseInt(loginInfo.uid) || 0,
      mtcGroupID: 21,
      compId: loginInfo.compGuid || '',
      userName: loginInfo.compGuid || '',
      password: loginInfo.webPswd || '',
      appGuid: "77C8F2FD-B1DE-4CEA-BE74-FD943B3BD54D"
    };
  } catch (error) {
    console.error("❌ Error fetching client data from external API:", error);
    throw error;
  }
}
