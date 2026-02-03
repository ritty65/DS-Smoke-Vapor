import crypto from 'crypto';

const readBody = async (req: any) =>
  new Promise<string>((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: string) => {
      data += chunk;
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });

const getEnv = (key: string) => {
  if (!process.env[key]) {
    throw new Error(`Missing ${key} environment variable.`);
  }
  return process.env[key];
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  try {
    const rawBody = typeof req.body === 'string' ? req.body : await readBody(req);
    const payload = rawBody ? JSON.parse(rawBody) : req.body;
    const { dataUrl, fileName, folder = 'ds-smoke-vapor' } = payload ?? {};

    if (!dataUrl || typeof dataUrl !== 'string') {
      res.status(400).json({ error: 'Missing dataUrl in request body.' });
      return;
    }

    const cloudName = getEnv('CLOUDINARY_CLOUD_NAME');
    const apiKey = getEnv('CLOUDINARY_API_KEY');
    const apiSecret = getEnv('CLOUDINARY_API_SECRET');

    const timestamp = Math.floor(Date.now() / 1000);
    const signaturePayload = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(signaturePayload).digest('hex');

    const form = new FormData();
    form.append('file', dataUrl);
    form.append('api_key', apiKey);
    form.append('timestamp', `${timestamp}`);
    form.append('signature', signature);
    form.append('folder', folder);
    if (fileName) {
      form.append('public_id', fileName.replace(/\.[^/.]+$/, ''));
    }

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: form
    });

    if (!response.ok) {
      const errorText = await response.text();
      res.status(502).json({ error: 'Cloudinary upload failed.', details: errorText });
      return;
    }

    const data = await response.json();
    res.status(200).json({
      url: data.secure_url,
      assetId: data.asset_id,
      publicId: data.public_id,
      width: data.width,
      height: data.height
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message ?? 'Unexpected server error.' });
  }
}
