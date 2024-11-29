import express from 'express';
import cors from 'cors';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { Customer } from '../types/customer';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const MONDAY_API_URL = 'https://api.monday.com/v2';

const createMondayClient = (apiKey: string) => {
  return new ApolloClient({
    uri: MONDAY_API_URL,
    cache: new InMemoryCache(),
    headers: {
      'Authorization': apiKey.startsWith('Bearer ') ? apiKey : `Bearer ${apiKey}`,
      'API-Version': '2024-01',
    },
  });
};

// Verify Monday.com webhook signature
const verifyMondaySignature = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const mondaySignature = req.headers['authorization'];
  if (!mondaySignature) {
    return res.status(401).json({ error: 'No signature provided' });
  }
  // In production, verify the signature against your Monday.com signing secret
  next();
};

app.post('/webhook/monday/customer', verifyMondaySignature, async (req, res) => {
  try {
    const { event } = req.body;

    // Only process item creation events
    if (event.type !== 'create_item') {
      return res.status(200).json({ message: 'Event type not relevant' });
    }

    const { boardId, itemId } = event;
    const mondayConfig = {
      apiKey: process.env.MONDAY_API_KEY
    };

    if (!mondayConfig?.apiKey) {
      return res.status(400).json({ error: 'Monday.com configuration not found' });
    }

    // Get item details from Monday.com
    const client = createMondayClient(mondayConfig.apiKey);
    const { data } = await client.query({
      query: gql`
        query GetItem($itemId: ID!) {
          items(ids: [$itemId]) {
            id
            name
            column_values {
              id
              title
              text
              value
              type
            }
          }
        }
      `,
      variables: { itemId },
    });

    const item = data.items[0];
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Extract customer data
    const getColumnValue = (title: string) => {
      const column = item.column_values.find((c: any) => c.title.toLowerCase() === title.toLowerCase());
      if (!column) return '';

      if (column.value) {
        try {
          const parsed = JSON.parse(column.value);
          if (column.type === 'phone') return parsed.phone;
          if (column.type === 'link') return parsed.url;
          if (parsed.text) return parsed.text;
          return column.text || '';
        } catch {
          return column.text || '';
        }
      }

      return column.text || '';
    };

    const newCustomer: Customer = {
      id: item.id,
      kontakt: item.name,
      telefon: getColumnValue('telefon'),
      whatsappGroupLink: getColumnValue('whatsapp group link'),
      reportsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store the customer data (in a real app, this would go to a database)
    console.log('New customer received:', newCustomer);

    res.status(200).json({ message: 'Customer received successfully', customer: newCustomer });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
});