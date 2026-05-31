// ResolveAI — /api/analyze.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

// ── Prompts ────────────────────────────────────────────────────────────────

const BASE_SCHEMA = `{
  "issue_type": "one of: Refund Delay | Flight Cancelled | Wrong Product | Return Rejected | No Support Response | Billing Error | Food Delivery Issue | Other",
  "company_name": "string or Unknown",
  "severity": "High | Medium | Low",
  "summary": "2-3 sentences: what happened, why legitimate grievance, what stage",
  "recommended_action": "single most effective next step — name channel, deadline, regulatory hook",
  "confidence_score": "integer 0-100",
  "escalation_path": {
    "next_step": "who to contact",
    "expected_reply": "realistic timeline",
    "fallback": "regulatory body if ignored",
    "likelihood": "Strong | Moderate | Uncertain"
  },
  "draft_emails": {
    "standard": "full email — first line Subject: ... then blank line then body",
    "firm": "firm tone, explicit deadline and regulatory threat, same format",
    "brief": "3-4 sentences max, same format"
  }
}`;

const DISPUTE_RULES = `Classification (first match wins):
- Flight Cancelled: airline cancelled/delayed flight, consumer seeks refund/compensation
- Refund Delay: money paid, refund promised/acknowledged but not credited
- Wrong Product: delivered item differs from ordered, counterfeit, misdescribed
- Return Rejected: return/replacement request denied or stalled
- Billing Error: wrong amount charged, double charge, charge for unordered item
- Food Delivery Issue: Zomato/Swiggy — wrong/missing items, food safety, delayed
- No Support Response: complaint acknowledged but closed without resolution
- Other: none of the above

Severity: High = money held >15 days OR return denied OR food safety risk. Medium = delay within norms but unacknowledged. Low = process ongoing within normal timelines.

Sector rules:
- Airline: cite DGCA CAR, suggest Nodal Officer, 7-day response expectation
- Railway: cite Railway Claims Tribunal Act 1987, suggest Divisional Railway Manager or IRCTC TDR
- E-commerce: cite Consumer Protection Act 2019 + E-Commerce Rules 2020, 30-day refund norm
- Food delivery: cite Consumer Protection Act 2019 + FSSAI 2006, 48-hour resolution expectation
- Banking/payments: cite RBI guidelines, suggest Nodal Officer, 30-day timeline

Draft email: use [Your Name], [Your Phone], [Your Email] as placeholders. Include any PNR/order ID visible in the document.
Confidence: 90-100 for uploaded docs with clear evidence. 70-89 text with IDs/dates. 50-69 vague. <50 unclear.
Return ONLY valid JSON. No markdown, no preamble.`;

const SYSTEM_PROMPT_ANALYZE = `You are ResolveAI, an expert consumer dispute analyst specialising in Indian consumer rights law.
Analyse the document or description provided and return ONLY valid JSON matching this schema:
${BASE_SCHEMA}
${DISPUTE_RULES}`;

const SYSTEM_PROMPT_FOLLOWUP = `You are ResolveAI. A consumer sent an escalation email that received no response.
Generate a follow-up escalation. Return ONLY valid JSON matching this schema:
${BASE_SCHEMA}

Follow-up rules:
- summary must state days elapsed and that there was no response
- recommended_action must reference the original complaint and suggest Nodal Officer or regulator filing
- draft_emails are genuine follow-ups, NOT the original email resent:
  - standard: references original email, restates key facts, sets firm 7-day deadline before regulator filing
  - firm: shorter, names specific regulator, states filing within 48 hours if no response
  - brief: 3 sentences — references original, states days elapsed, gives 48-hour ultimatum
- severity: increase one level vs original if money still outstanding
${DISPUTE_RULES}`;

const SYSTEM_PROMPT_RESPONSE = `You are ResolveAI. A consumer received a reply from a company after escalating a dispute.
Classify that reply and generate counter-response drafts. Return ONLY valid JSON matching this schema:
${BASE_SCHEMA.replace('"draft_emails":', '"reply_classification": "genuine_resolution | stall | partial_resolution | rejection",\n  "draft_emails":')}

Classification rules:
- genuine_resolution: company confirmed refund/replacement with a specific date or transaction ID
- stall: vague acknowledgment, no timeline, auto-reply, repeated ticket closure
- partial_resolution: offers something less than owed (partial refund, voucher instead of cash)
- rejection: company explicitly refuses the claim

draft_emails are COUNTER-RESPONSE drafts:
- standard: counter their reply, cite what they said and why it is insufficient, set deadline
- firm: direct, names regulator being filed with if no resolution in 48 hours
- brief: 3 sentences, factual, firm

summary must describe: what the company said, classification, recommended next action.
${DISPUTE_RULES}`;

// ── Retry helper ───────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const callGemini = async (model, payload, attempt = 1) => {
  try {
    return await model.generateContent(payload);
  } catch (err) {
    const isRate = err.message?.includes('429') || err.message?.toLowerCase().includes('quota') || err.status === 429;
    if (attempt === 1 && !isRate) { await sleep(2000); return callGemini(model, payload, 2); }
    throw err;
  }
};

// ── Handler ────────────────────────────────────────────────────────────────

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  let body;
  try { body = JSON.parse(await readBody(req)); }
  catch { res.status(400).json({ error: 'Invalid JSON body.' }); return; }

  const {
    file, mimeType, fileName, description,
    files,
    mode = 'analyze',
    originalContext, originalDraft, daysElapsed,
    companyReply,
  } = body;

  const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

  if (mode === 'analyze') {
    const hasFile = file || (Array.isArray(files) && files.length > 0);
    if (!hasFile && !description) { res.status(400).json({ error: 'Please provide a file or text description.' }); return; }
    if (!hasFile && typeof description === 'string' && !description.trim()) { res.status(400).json({ error: 'Please describe your dispute.' }); return; }
    if (description && description.length > 3000) { res.status(400).json({ error: 'Description too long. Max 3000 characters.' }); return; }
    if (Array.isArray(files) && files.length > 3) { res.status(400).json({ error: 'Maximum 3 files allowed.' }); return; }
    if (file && mimeType && !ALLOWED_MIME.includes(mimeType)) { res.status(400).json({ error: 'Unsupported file type. Use JPG, PNG, WebP, or PDF.' }); return; }
    if (Array.isArray(files)) {
      for (const f of files) {
        if (f.mimeType && !ALLOWED_MIME.includes(f.mimeType)) { res.status(400).json({ error: `Unsupported type: ${f.fileName || f.mimeType}` }); return; }
      }
    }
  }
  if (mode === 'followup' && !originalContext) { res.status(400).json({ error: 'originalContext required.' }); return; }
  if (mode === 'analyze-response') {
    if (!companyReply?.trim()) { res.status(400).json({ error: 'Paste the company reply to analyse.' }); return; }
    if (!originalContext) { res.status(400).json({ error: 'originalContext required.' }); return; }
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) { res.status(500).json({ error: 'Server configuration error.' }); return; }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json', temperature: 0.3, topP: 0.9 },
    });

    const parts = [];

    if (mode === 'analyze') {
      const fileList = Array.isArray(files) && files.length > 0 ? files : file ? [{ file, mimeType, fileName }] : [];
      for (const f of fileList) {
        parts.push({ inlineData: { data: f.file, mimeType: f.mimeType || 'application/octet-stream' } });
        if (f.fileName) parts.push({ text: `File: ${String(f.fileName).replace(/[\r\n]/g, ' ').slice(0, 120)}` });
      }
      if (description) parts.push({ text: `Consumer dispute: "${description}". Analyse as a submitted document.` });
      parts.push({ text: SYSTEM_PROMPT_ANALYZE });
    }

    if (mode === 'followup') {
      const days = parseInt(daysElapsed, 10) || 7;
      const ctx = typeof originalContext === 'string' ? originalContext : JSON.stringify(originalContext);
      parts.push({ text: `ORIGINAL DISPUTE:\n${ctx}\n\nORIGINAL EMAIL SENT:\n${originalDraft || '(not provided)'}\n\nDAYS WITH NO RESPONSE: ${days}\n\n${SYSTEM_PROMPT_FOLLOWUP}` });
    }

    if (mode === 'analyze-response') {
      const ctx = typeof originalContext === 'string' ? originalContext : JSON.stringify(originalContext);
      parts.push({ text: `ORIGINAL DISPUTE:\n${ctx}\n\nCOMPANY REPLY:\n"${companyReply}"\n\n${SYSTEM_PROMPT_RESPONSE}` });
    }

    const result = await callGemini(model, { contents: [{ role: 'user', parts }] });
    const raw = result.response.text().trim();

    let data;
    try { data = JSON.parse(raw); }
    catch {
      const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) { data = JSON.parse(match[1].trim()); }
      else { throw new Error('Could not parse model response as JSON'); }
    }

    for (const key of ['issue_type', 'severity', 'summary', 'draft_emails']) {
      if (data[key] == null) throw new Error(`Missing field: ${key}`);
    }

    res.status(200).json(data);

  } catch (err) {
    console.error('[ResolveAI]', err.message);
    const isRate = err.message?.includes('429') || err.message?.toLowerCase().includes('quota') || err.status === 429;
    if (isRate) { res.status(429).json({ error: 'Too many requests. Please wait 30 seconds and try again.' }); return; }
    res.status(500).json({ error: 'Analysis failed. Please try again or try a different file format.' });
  }
};
