// ResolveAI — /api/analyze.js
// Plain Vercel serverless function (CommonJS, non-Next.js).
// Accepts a JSON body with either:
//   { file: "<base64>", mimeType: "image/jpeg", fileName: "..." }
// or:
//   { description: "Flight cancelled, no refund" }
// Returns structured dispute analysis JSON from Gemini 2.5 Flash.

const { GoogleGenerativeAI } = require('@google/generative-ai');

// ── Body reader (Vercel plain functions don't auto-parse JSON) ─────────────

async function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

// ── Gemini prompt ──────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are ResolveAI, an expert consumer dispute analyst specialising in Indian consumer rights law.
Analyse the document or description provided and return ONLY a valid JSON object — no markdown fences, no preamble, no explanation.

Return exactly this structure:
{
  "issue_type": "string — one of: Refund Delay | Flight Cancelled | Wrong Product | Return Rejected | No Support Response | Billing Error | Other",
  "company_name": "string — the airline or e-commerce brand name extracted from the document, or 'Unknown'",
  "severity": "High | Medium | Low",
  "summary": "string — 2–3 sentences in plain English: what happened, why it is a legitimate grievance, and what stage the user is at",
  "recommended_action": "string — the single most effective next step the consumer should take right now (be specific: name the channel, the deadline, the regulatory hook)",
  "confidence_score": integer between 0 and 100,
  "escalation_path": {
    "next_step": "string — who to contact (e.g. Nodal Officer, Grievance Officer, Consumer Forum)",
    "expected_reply": "string — realistic timeline e.g. '5–7 business days'",
    "fallback": "string — the regulatory body to escalate to if ignored (e.g. DGCA, NCDRC, Consumer Court)",
    "likelihood": "Strong | Moderate | Uncertain"
  },
  "draft_emails": {
    "standard": "string — full professional escalation email; first line is the subject prefixed with 'Subject: '; one blank line separates subject from body",
    "firm": "string — firm tone with explicit deadline and regulatory threat, same format",
    "brief": "string — short and direct, still polite, same format"
  }
}

Rules:
- Airline disputes: cite DGCA regulations, suggest Nodal Officer contact, reference 7-day response expectation under CAR.
- E-commerce disputes: cite Consumer Protection Act 2019, suggest Grievance Officer, reference 30-day refund norm.
- Severity: High = money held >15 days OR defective item return denied; Medium = delay within norms but unacknowledged; Low = process ongoing but slow.
- Draft emails must use [Your Name], [Your Phone], [Your Email] as placeholders.
- If a PNR, order ID, ticket number, or booking reference is visible in the document, include it in the draft emails.
- All three draft tones must have meaningfully different content — not just the same email with minor edits.
- Return ONLY the JSON object. Nothing else.`;

// ── Handler ────────────────────────────────────────────────────────────────

module.exports = async function handler(req, res) {
  // CORS — allow frontend on any origin (Vercel preview URLs vary)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Parse JSON body manually (Vercel plain functions don't auto-parse)
  let body;
  try {
    const raw = await readBody(req);
    body = JSON.parse(raw);
  } catch {
    res.status(400).json({ error: 'Invalid request — could not parse JSON body.' });
    return;
  }

  const { file, mimeType, fileName, description } = body;

  if (!file && !description) {
    res.status(400).json({
      error: 'Please provide either a file upload or a text description of your dispute.',
    });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[ResolveAI] GEMINI_API_KEY is not set');
    res.status(500).json({ error: 'Server configuration error. Please contact support.' });
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    // Model name: verify at https://ai.google.dev/gemini-api/docs/models/gemini
    // Update this string if Gemini 2.5 Flash has a new stable ID.
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
        topP: 0.9,
      },
    });

    // Build multimodal parts
    const parts = [];

    if (file) {
      parts.push({
        inlineData: {
          data: file, // raw base64 (no data: prefix)
          mimeType: mimeType || 'application/octet-stream',
        },
      });
      if (fileName) {
        parts.push({ text: `The uploaded file is named: ${fileName}` });
      }
    } else {
      parts.push({
        text: `The user describes their consumer dispute as follows: "${description}".\nPlease analyse this as if it were a submitted document.`,
      });
    }

    // System prompt goes last
    parts.push({ text: SYSTEM_PROMPT });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts }],
    });

    const raw = result.response.text().trim();

    // Parse JSON — with fallback for models that wrap in markdown code blocks
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        data = JSON.parse(match[1].trim());
      } else {
        console.error('[ResolveAI] Unparseable response:', raw.slice(0, 300));
        throw new Error('Could not parse model response as JSON');
      }
    }

    // Light validation
    const required = ['issue_type', 'severity', 'summary', 'draft_emails'];
    for (const key of required) {
      if (!data[key]) {
        throw new Error(`Model response missing required field: ${key}`);
      }
    }

    res.status(200).json(data);

  } catch (err) {
    console.error('[ResolveAI] Error:', err.message);
    res.status(500).json({
      error: 'Analysis failed. Please try again — if this keeps happening, try a different file format.',
    });
  }
};
