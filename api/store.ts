import fs from 'fs/promises';
import path from 'path';

const readBody = async (req: any) =>
  new Promise<string>((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: string) => {
      data += chunk;
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });

const loadStore = async () => {
  const storePath = path.join(process.cwd(), 'data', 'store.json');
  const raw = await fs.readFile(storePath, 'utf-8');
  return { storePath, store: JSON.parse(raw) };
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  try {
    const rawBody = typeof req.body === 'string' ? req.body : await readBody(req);
    const payload = rawBody ? JSON.parse(rawBody) : req.body;
    const { collection, category, itemName, imageUrl } = payload ?? {};

    if (!collection || !itemName || !imageUrl) {
      res.status(400).json({ error: 'Missing collection, itemName, or imageUrl.' });
      return;
    }

    const { storePath, store } = await loadStore();
    let updated = false;

    if (collection === 'inventory') {
      if (!category || !store.inventory?.[category]) {
        res.status(400).json({ error: 'Missing or invalid category for inventory update.' });
        return;
      }
      const items = store.inventory[category];
      const item = items.find((entry: any) => entry.name === itemName);
      if (!item) {
        res.status(404).json({ error: 'Inventory item not found.' });
        return;
      }
      item.image = imageUrl;
      updated = true;
    }

    if (collection === 'flowerStrains') {
      const strain = store.flowerStrains?.find((entry: any) => entry.name === itemName);
      if (!strain) {
        res.status(404).json({ error: 'Flower strain not found.' });
        return;
      }
      strain.image = imageUrl;
      updated = true;
    }

    if (!updated) {
      res.status(400).json({ error: 'No updates were applied.' });
      return;
    }

    await fs.writeFile(storePath, JSON.stringify(store, null, 2));
    res.status(200).json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ error: error?.message ?? 'Unexpected server error.' });
  }
}
