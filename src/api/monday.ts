import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { MondayBoard, MondayWorkspace } from '../types/monday';
import { Customer } from '../types/customer';
import { toast } from 'react-hot-toast';

const MONDAY_API_URL = 'https://api.monday.com/v2';

export const createMondayClient = (apiKey: string) => {
  return new ApolloClient({
    uri: MONDAY_API_URL,
    cache: new InMemoryCache(),
    headers: {
      'Authorization': apiKey.startsWith('Bearer ') ? apiKey : `Bearer ${apiKey}`,
      'API-Version': '2024-01',
    },
  });
};

export const verifyMondayConnection = async (apiKey: string): Promise<boolean> => {
  try {
    const client = createMondayClient(apiKey);
    
    const { data } = await client.query({
      query: gql`
        query {
          me {
            id
            name
          }
        }
      `,
      fetchPolicy: 'network-only'
    });

    return !!data.me;
  } catch (error) {
    console.error('Monday.com verification error:', error);
    return false;
  }
};

export const fetchMondayBoards = async (apiKey: string): Promise<MondayBoard[]> => {
  if (!apiKey) {
    console.error('API key is required');
    return [];
  }

  try {
    const client = createMondayClient(apiKey);
    
    const { data } = await client.query({
      query: gql`
        query {
          boards (limit: 100) {
            id
            name
            description
          }
        }
      `,
      fetchPolicy: 'network-only'
    });

    return data.boards || [];
  } catch (error) {
    console.error('Failed to fetch Monday.com boards:', error);
    toast.error('Failed to fetch Monday.com boards. Please check your API key.');
    return [];
  }
};

export const fetchMondayWorkspaces = async (apiKey: string): Promise<MondayWorkspace[]> => {
  if (!apiKey) {
    console.error('API key is required');
    return [];
  }

  try {
    const client = createMondayClient(apiKey);
    
    const { data } = await client.query({
      query: gql`
        query {
          workspaces {
            id
            name
            description
          }
        }
      `,
      fetchPolicy: 'network-only'
    });

    return data.workspaces || [];
  } catch (error) {
    console.error('Failed to fetch Monday.com workspaces:', error);
    toast.error('Failed to fetch Monday.com workspaces. Please check your API key.');
    return [];
  }
};

export const syncMondayCustomers = async (
  apiKey: string,
  boardId?: string,
  onDebug?: (data: any) => void
): Promise<Customer[] | null> => {
  if (!apiKey || !boardId) {
    toast.error('Monday.com API key and board ID are required');
    return null;
  }

  try {
    const client = createMondayClient(apiKey);
    const customers: Customer[] = [];

    onDebug?.({
      status: 'Starting sync...',
      processedItems: 0,
      totalItems: 0
    });

    // First, get the column structure
    const { data: columnsData } = await client.query({
      query: gql`
        query GetBoardColumns($boardId: ID!) {
          boards(ids: [$boardId]) {
            columns {
              id
              title
              type
            }
          }
        }
      `,
      variables: { boardId },
      fetchPolicy: 'network-only'
    });

    const columns = columnsData.boards[0].columns;
    
    onDebug?.({
      status: 'Retrieved board columns',
      columns
    });

    // Now get the items with their values
    const { data } = await client.query({
      query: gql`
        query GetBoardItems($boardId: ID!) {
          boards(ids: [$boardId]) {
            name
            items_page(limit: 500) {
              items {
                id
                name
                column_values {
                  id
                  text
                  value
                }
                subitems {
                  id
                }
              }
            }
          }
        }
      `,
      variables: { boardId },
      fetchPolicy: 'network-only'
    });

    const items = data.boards[0].items_page.items;

    onDebug?.({
      status: 'Processing items...',
      processedItems: 0,
      totalItems: items.length,
      apiResponse: { 
        boardName: data.boards[0].name,
        sampleItems: items.slice(0, 2)
      }
    });

    // Process items
    for (const item of items) {
      // Skip items that are subitems or don't have a name
      if (!item.name || item.subitems?.length > 0) {
        continue;
      }

      const getColumnValue = (columnTitle: string) => {
        const column = columns.find((c: any) => 
          c.title.toLowerCase() === columnTitle.toLowerCase()
        );
        
        if (!column) return '';

        const value = item.column_values.find((cv: any) => cv.id === column.id);
        if (!value) return '';

        if (value.value) {
          try {
            const parsed = JSON.parse(value.value);
            if (column.type === 'phone') return parsed.phone;
            if (column.type === 'link') return parsed.url;
            if (parsed.text) return parsed.text;
            return value.text || '';
          } catch {
            return value.text || '';
          }
        }

        return value.text || '';
      };

      const telefon = getColumnValue('telefon');
      const whatsappLink = getColumnValue('whatsapp group link');

      customers.push({
        id: item.id,
        kontakt: item.name,
        telefon,
        whatsappGroupLink: whatsappLink,
        reportsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      onDebug?.({
        status: 'Processing items...',
        processedItems: customers.length,
        totalItems: items.length
      });
    }

    onDebug?.({
      status: 'Sync completed',
      processedItems: customers.length,
      totalItems: items.length,
      apiResponse: { 
        customerCount: customers.length,
        sampleCustomers: customers.slice(0, 2)
      }
    });

    return customers;
  } catch (error) {
    console.error('Failed to sync Monday.com customers:', error);
    onDebug?.({
      status: 'Sync failed',
      processedItems: 0,
      totalItems: 0,
      error
    });
    throw error;
  }
};