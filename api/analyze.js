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
  "issue_type": "string — one of: Refund Delay | Flight Cancelled | Wrong Product | Return Rejected | No Support Response | Billing Error | Food Delivery Issue | Other",
  "company_name": "string — the airline, e-commerce, food delivery, or service brand name extracted from the document, or 'Unknown'",
  "severity": "High | Medium | Low",
  "summary": "string — 2–3 sentences in plain English: what happened, why it is a legitimate grievance, and what stage the user is at",
  "recommended_action": "string — the single most effective next step the consumer should take right now (be specific: name the channel, the deadline, the regulatory hook)",
  "confidence_score": integer between 0 and 100,
  "escalation_path": {
    "next_step": "string — who to contact (e.g. Nodal Officer, Grievance Officer, Consumer Forum, FSSAI)",
    "expected_reply": "string — realistic timeline e.g. '5–7 business days'",
    "fallback": "string — the regulatory body to escalate to if ignored (e.g. DGCA, NCDRC, Consumer Court, FSSAI, National Consumer Helpline)",
    "likelihood": "Strong | Moderate | Uncertain"
  },
  "draft_emails": {
    "standard": "string — full professional escalation email; first line is the subject prefixed with 'Subject: '; one blank line separates subject from body",
    "firm": "string — firm tone with explicit deadline and regulatory threat, same format",
    "brief": "string — short and direct, still polite, same format"
  }
}

Classification rules (use the FIRST matching rule):
- issue_type = "Flight Cancelled" if an airline cancelled or significantly delayed a flight and the consumer seeks a refund or compensation.
- issue_type = "Refund Delay" if money was paid and a refund was promised or acknowledged but not credited within the stated window, for any sector (airline, rail, e-commerce).
- issue_type = "Wrong Product" if the item delivered is different from what was ordered, counterfeit, or significantly misdescribed.
- issue_type = "Return Rejected" if the consumer raised a return/replacement request and the seller or platform denied it or stopped responding after initiating it.
- issue_type = "Billing Error" if the consumer was charged the wrong amount, charged twice, or charged for something not ordered.
- issue_type = "Food Delivery Issue" if the dispute involves a food delivery platform (Zomato, Swiggy, etc.) — including wrong items, missing items, food quality complaints, foodborne illness, or delayed delivery.
- issue_type = "No Support Response" if the core complaint is that the company's grievance/support channel acknowledged the complaint but closed it without resolution, or stopped responding entirely — and no other specific category above fits better.
- issue_type = "Other" only if none of the above categories apply.

Sector-specific rules:
- Airline disputes: cite DGCA Civil Aviation Requirements (CAR), suggest Nodal Officer contact, reference 7-day response expectation. For international flights also cite ICAO/Montreal Convention where relevant.
- Railway disputes: cite Railway Claims Tribunal Act 1987, suggest Divisional Railway Manager or TDR filing via IRCTC, mention National Consumer Helpline (1800-11-4000) as fallback.
- E-commerce disputes: cite Consumer Protection Act 2019 and E-Commerce Rules 2020, suggest Grievance Officer, reference 30-day refund norm.
- Food delivery disputes: cite Consumer Protection Act 2019 and Food Safety and Standards Act 2006, suggest platform Grievance Officer and FSSAI complaint (if food safety issue), reference 48-hour resolution expectation for food apps.
- Banking/payments disputes: cite RBI guidelines, suggest bank Nodal Officer, reference 30-day resolution timeline.

Severity rules:
- High = money held >15 days OR defective/wrong item return denied OR food safety/health risk involved OR critical service failure.
- Medium = delay within standard norms but complaint unacknowledged OR item issue acknowledged but resolution stalled.
- Low = process ongoing and within normal timelines but consumer needs guidance.

Confidence score calibration:
- Score 90–100 only when a document with clear evidence (screenshots, order IDs, receipts, email trails) is provided AND the facts are unambiguous.
- Score 70–89 for clear text descriptions with specific order IDs / dates / amounts.
- Score 50–69 for vague descriptions without supporting references.
- Score below 50 when the facts are unclear or the dispute may not constitute a valid consumer grievance.

Draft email rules:
- Draft emails must use [Your Name], [Your Phone], [Your Email] as placeholders.
- If a PNR, order ID, ticket number, TDR number, or booking reference is visible in the document, include it in the draft emails.
- All three draft tones must have meaningfully different content — not just the same email with minor edits.
- Standard: professional, factual, gives the company one last chance with a clear deadline.
- Firm: direct, names the specific regulatory body and consequence, shorter.
- Brief: 3–4 sentences maximum, still respectful, designed for quick copy-paste.

Return ONLY the JSON object. Nothing else.`;

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

  // ── Input validation ───────────────────────────────────────────────────────

  const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  const MAX_DESCRIPTION_CHARS = 3000;

  // Both missing
  if (!file && !description) {
    res.status(400).json({
      error: 'Please provide either a file upload or a text description of your dispute.',
    });
    return;
  }

  // Whitespace-only description
  if (!file && typeof description === 'string' && description.trim().length === 0) {
    res.status(400).json({
      error: 'Please describe your dispute in a few words before analysing.',
    });
    return;
  }

  // Description too long
  if (description && description.length > MAX_DESCRIPTION_CHARS) {
    res.status(400).json({
      error: `Description is too long. Please keep it under ${MAX_DESCRIPTION_CHARS} characters.`,
    });
    return;
  }

  // mimeType allowlist for file uploads
  if (file && mimeType && !ALLOWED_MIME_TYPES.includes(mimeType)) {
    res.status(400).json({
      error: 'Unsupported file type. Please upload a JPG, PNG, WebP, or PDF.',
    });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[ResolveAI] GEMINI_API_KEY is not set');
    res.status(500).json({ error: 'Server configuration error. Please contact support.' });
    return;
  }

  // ── Retry helper — one automatic retry for transient failures ─────────────
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const callGemini = async (model, payload, attempt = 1) => {
    try {
      return await model.generateContent(payload);
    } catch (err) {
      const isRateLimit =
        err.message?.includes('429') ||
        err.message?.toLowerCase().includes('quota') ||
        err.message?.toLowerCase().includes('rate') ||
        err.status === 429;

      // Retry once after 2s for transient / rate-limit errors
      if (attempt === 1 && !isRateLimit) {
        console.warn('[ResolveAI] Transient error on attempt 1, retrying:', err.message);
        await sleep(2000);
        return callGemini(model, payload, 2);
      }
      throw err;
    }
  };

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
        // Strip newlines and limit length to prevent prompt injection via filename
        const safeName = String(fileName).replace(/[\r\n]/g, ' ').slice(0, 120);
        parts.push({ text: `The uploaded file is named: ${safeName}` });
      }
    } else {
      parts.push({
        text: `The user describes their consumer dispute as follows: "${description}".\nPlease analyse this as if it were a submitted document.`,
      });
    }

    // System prompt goes last
    parts.push({ text: SYSTEM_PROMPT });

    const result = await callGemini(model, {
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

    // Light validation — use explicit undefined/null check so 0 and "" don't falsely fail
    const required = ['issue_type', 'severity', 'summary', 'draft_emails'];
    for (const key of required) {
      if (data[key] === undefined || data[key] === null) {
        throw new Error(`Model response missing required field: ${key}`);
      }
    }

    res.status(200).json(data);

  } catch (err) {
    console.error('[ResolveAI] Error:', err.message);

    // Detect Gemini rate-limit errors (HTTP 429) — give a user-friendly message
    const isRateLimit =
      err.message?.includes('429') ||
      err.message?.toLowerCase().includes('quota') ||
      err.message?.toLowerCase().includes('rate') ||
      err.status === 429;

    if (isRateLimit) {
      res.status(429).json({
        error: 'Too many requests — our AI is busy right now. Please wait 30 seconds and try again.',
      });
      return;
    }

    res.status(500).json({
      error: 'Analysis failed. Please try again — if this keeps happening, try a different file format.',
    });
  }
};
