/*
 * AI invoice scanner: sends an invoice photo or PDF to the Claude API and gets
 * back vendor, invoice number/date and product lines as JSON (structured outputs).
 * Called straight from the browser with the admin's own API key (Settings), which
 * stays on this device.
 */
(function (root) {
  const API = 'https://api.anthropic.com/v1/messages';

  function schema(productNames) {
    const str = { type: 'string' };
    return {
      type: 'object',
      additionalProperties: false,
      required: ['vendor_name', 'invoice_number', 'invoice_date', 'lines'],
      properties: {
        vendor_name: str,
        invoice_number: str,
        invoice_date: { type: 'string', description: 'YYYY-MM-DD, or empty if not printed' },
        lines: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['product_name', 'matched_product', 'quantity', 'batch', 'expiry', 'purchase_rate', 'gst_percent'],
            properties: {
              product_name: { type: 'string', description: 'Product name exactly as printed' },
              matched_product: { type: 'string', enum: [...productNames, ''], description: 'The clinic product this line is, or empty if none fits' },
              quantity: { type: 'number', description: 'Units billed (pens, sachets, boxes as billed). Free quantity added in.' },
              batch: str,
              expiry: { type: 'string', description: 'YYYY-MM or YYYY-MM-DD, or empty' },
              purchase_rate: { type: 'number', description: 'Rate per unit before GST' },
              gst_percent: { type: 'number', description: 'GST % for the line (CGST+SGST or IGST); 0 if not shown' },
            },
          },
        },
      },
    };
  }

  const PROMPT = (products) => `This is a purchase invoice for a clinic in India. Extract the vendor, invoice number, invoice date and every product line.

For each line, set matched_product to the clinic product it is, choosing from this list, and leave it empty when none fits. A dose must match exactly (Mounjaro 2.5 mg is "Mounjaro 2.5mg", never "Mounjaro 5mg").
${products.map((p) => `- ${p}`).join('\n')}

Quantities are units as billed; add any free quantity to the billed quantity. Leave a field empty (or 0 for numbers) when it is not printed on the invoice rather than guessing.`;

  // Resize photos so the upload stays small and fast (long side ≤ 2000 px).
  function imageToBase64(file, max = 2000) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve({ media_type: 'image/jpeg', data: c.toDataURL('image/jpeg', 0.9).split(',')[1] });
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read that image')); };
      img.src = url;
    });
  }
  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1]);
    r.onerror = () => reject(new Error('Could not read that file'));
    r.readAsDataURL(file);
  });

  async function scanInvoice(file, opts) {
    if (!opts.apiKey) throw new Error('Add your Claude API key in Settings to scan invoices.');
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
    const block = isPdf
      ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: await fileToBase64(file) } }
      : { type: 'image', source: { type: 'base64', ...(await imageToBase64(file)) } };
    const res = await fetch(API, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': opts.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        // If the main model declines, the API retries on a fallback model in the same call.
        'anthropic-beta': 'server-side-fallback-2026-07-01',
      },
      body: JSON.stringify({
        model: opts.model || 'claude-opus-5-5',
        max_tokens: 16000,
        fallbacks: 'default',
        output_config: { effort: 'medium', format: { type: 'json_schema', schema: schema(opts.products) } },
        messages: [{ role: 'user', content: [block, { type: 'text', text: PROMPT(opts.products) }] }],
      }),
    });
    let body = null;
    try { body = await res.json(); } catch (_) { body = null; }
    if (!res.ok) {
      const msg = body && body.error ? body.error.message : res.statusText;
      if (res.status === 401) throw new Error('The Claude API key was not accepted. Check it in Settings.');
      if (res.status === 429 || res.status >= 500) throw new Error(`The AI service is busy (${res.status}). Try again in a minute.`);
      throw new Error(`Invoice scan failed (${res.status}): ${msg}`);
    }
    if (body.stop_reason === 'refusal') throw new Error('The AI declined to read this file. Enter the invoice manually.');
    if (body.stop_reason === 'max_tokens') throw new Error('The invoice is too long to read in one go. Scan it page by page.');
    const text = (body.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
    let out;
    try { out = JSON.parse(text); } catch (_) { throw new Error('The AI reply could not be read. Try a clearer photo.'); }
    return out;
  }

  const api = { scanInvoice, schema };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.INVOICE = api;
})(typeof window !== 'undefined' ? window : globalThis);
