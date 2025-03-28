import { NextResponse } from 'next/server';
import { getClient, listClients, deleteClient, createClient } from '@/services/clientService';

// Helper function to add CORS headers
function corsResponse(data: any, status: number = 200) {
  const response = NextResponse.json(data, { status });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function OPTIONS() {
  return corsResponse({}, 200);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      // Get single client
      const client = await getClient(id);
      if (!client) {
        return corsResponse(
          { error: 'Client not found' },
          404
        );
      }
      return corsResponse(client);
    }

    // List all clients
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const result = await listClients({
      page,
      limit,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    return corsResponse(result);
  } catch (error) {
    return corsResponse(
      { error: 'Failed to fetch clients' },
      500
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return corsResponse(
        { error: 'Client ID is required' },
        400
      );
    }

    const deleted = await deleteClient(id);
    if (!deleted) {
      return corsResponse(
        { error: 'Client not found' },
        404
      );
    }

    return corsResponse({ message: 'Client deleted successfully' });
  } catch (error) {
    return corsResponse(
      { error: 'Failed to delete client' },
      500
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await createClient(body);
    return corsResponse(client, 201);
  } catch (error) {
    if (error instanceof Error) {
      return corsResponse(
        { error: error.message },
        400
      );
    }
    return corsResponse(
      { error: 'Failed to create client' },
      500
    );
  }
} 