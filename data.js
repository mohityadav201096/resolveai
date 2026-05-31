// ResolveAI — Static data: contacts, evidence checklists, regulator links
// All keys match Gemini issue_type and company_name outputs exactly (lowercase-normalised at lookup time)

window.RESOLVE_DATA = {

  // ── Company contact lookup ──────────────────────────────────────────────
  // portal: official grievance/support page
  // nodal: nodal officer email (verify currency before use)
  // support: general customer support email
  contacts: {
    'indigo': {
      display: 'IndiGo',
      nodal: 'nodalofficer@goindigo.in',
      support: 'customer.relations@goindigo.in',
      portal: 'https://www.goindigo.in/information/contact-us.html',
      sector: 'airline'
    },
    'air india': {
      display: 'Air India',
      nodal: 'nodalofficer@airindia.in',
      support: 'customercare@airindia.in',
      portal: 'https://www.airindia.com/in/en/contact-us.html',
      sector: 'airline'
    },
    'spicejet': {
      display: 'SpiceJet',
      nodal: 'nodalofficer@spicejet.com',
      support: 'customercare@spicejet.com',
      portal: 'https://corporate.spicejet.com/contactus.aspx',
      sector: 'airline'
    },
    'akasa air': {
      display: 'Akasa Air',
      support: 'feedback@akasaair.com',
      portal: 'https://www.akasaair.com/contact-us',
      sector: 'airline'
    },
    'vistara': {
      display: 'Vistara',
      nodal: 'nodalofficer@airvistara.com',
      support: 'customer.support@airvistara.com',
      portal: 'https://www.airvistara.com/in/en/contact-us',
      sector: 'airline'
    },
    'amazon': {
      display: 'Amazon India',
      support: 'cs-reply@amazon.in',
      portal: 'https://www.amazon.in/gp/help/customer/contact-us',
      grievance_officer: 'grievance-officer@amazon.com',
      sector: 'ecommerce'
    },
    'flipkart': {
      display: 'Flipkart',
      support: 'cs@flipkart.com',
      portal: 'https://www.flipkart.com/helpcentre',
      sector: 'ecommerce'
    },
    'myntra': {
      display: 'Myntra',
      support: 'support@myntra.com',
      portal: 'https://www.myntra.com/contactus',
      sector: 'ecommerce'
    },
    'meesho': {
      display: 'Meesho',
      support: 'help@meesho.com',
      portal: 'https://meesho.com/help',
      sector: 'ecommerce'
    },
    'nykaa': {
      display: 'Nykaa',
      support: 'support@nykaa.com',
      portal: 'https://www.nykaa.com/contact-us',
      sector: 'ecommerce'
    },
    'zomato': {
      display: 'Zomato',
      support: 'support@zomato.com',
      portal: 'https://www.zomato.com/contact',
      sector: 'food_delivery'
    },
    'swiggy': {
      display: 'Swiggy',
      support: 'support@swiggy.com',
      portal: 'https://www.swiggy.com/support',
      sector: 'food_delivery'
    },
    'irctc': {
      display: 'IRCTC',
      support: 'care@irctc.co.in',
      portal: 'https://www.irctc.co.in/nget/grievance',
      helpline: '14646',
      sector: 'railway'
    },
    'makemytrip': {
      display: 'MakeMyTrip',
      support: 'customercare@makemytrip.com',
      portal: 'https://support.makemytrip.com',
      sector: 'travel'
    },
    'goibibo': {
      display: 'Goibibo',
      support: 'support@goibibo.com',
      portal: 'https://www.goibibo.com/customerservice',
      sector: 'travel'
    },
    'ola': {
      display: 'Ola',
      support: 'support@olacabs.com',
      portal: 'https://help.olacabs.com',
      sector: 'transport'
    },
    'uber': {
      display: 'Uber',
      portal: 'https://help.uber.com/riders',
      sector: 'transport'
    },
    'paytm': {
      display: 'Paytm',
      support: 'grievance@paytm.com',
      portal: 'https://paytm.com/care',
      sector: 'payments'
    },
    'phonepe': {
      display: 'PhonePe',
      support: 'support@phonepe.com',
      portal: 'https://support.phonepe.com',
      sector: 'payments'
    },
    'hdfc': {
      display: 'HDFC Bank',
      support: 'support@hdfcbank.com',
      portal: 'https://www.hdfcbank.com/content/bbp/repositories/723fb80a-2dde-42a3-9793-7ae1be57c87f/?folderPath=/Common/Grievance+Redressal/&fileName=Grievance+Redressal.pdf',
      nodal: 'nodalofficer@hdfcbank.com',
      sector: 'banking'
    },
    'sbi': {
      display: 'State Bank of India',
      support: 'contactcentre@sbi.co.in',
      portal: 'https://crcf.sbi.co.in/ccf/',
      sector: 'banking'
    },
    'icici': {
      display: 'ICICI Bank',
      support: 'customer.care@icicibank.com',
      portal: 'https://www.icicibank.com/manage-your-account/customer-grievance-redressal',
      sector: 'banking'
    },
  },

  // ── Evidence checklists by issue_type ─────────────────────────────────
  evidence: {
    'Flight Cancelled': [
      'Original booking confirmation (with PNR)',
      'Flight cancellation notice from airline',
      'Any refund acknowledgment or ticket raised',
      'Bank/card statement showing the debit',
      'All follow-up emails / support ticket screenshots',
    ],
    'Refund Delay': [
      'Original order confirmation or booking receipt',
      'Cancellation or return confirmation from the company',
      'Any refund timeline promise received (email/SMS)',
      'Bank/card statement showing payment not credited',
      'All follow-up support ticket screenshots',
    ],
    'Wrong Product': [
      'Original order confirmation (item description + price)',
      'Photos of the product actually delivered',
      'Delivery confirmation / courier photo if available',
      'Screenshots of the listing at time of purchase',
      'All return/complaint requests raised with the company',
    ],
    'Return Rejected': [
      'Original order confirmation',
      'Photos of the item showing defect or mismatch',
      'Screenshot of return request submitted',
      'Company response denying the return',
      'Any policy screenshot showing you were eligible for return',
    ],
    'No Support Response': [
      'All complaint emails or ticket IDs sent to the company',
      'Auto-acknowledgment emails received',
      'Proof the issue occurred (invoice, booking, receipt)',
      'Timeline showing how long the complaint has been open',
    ],
    'Billing Error': [
      'Original invoice or bill showing incorrect charge',
      'Bank/card statement showing the actual debit',
      'Any communication acknowledging the billing error',
      'Screenshot of the correct pricing at time of purchase',
    ],
    'Food Delivery Issue': [
      'Order confirmation with item list and total',
      'Photos of wrong/missing/damaged items delivered',
      'Screenshot of the delivery confirmation',
      'All complaints raised with the platform',
      'If food safety: medical evidence or photos of the food',
    ],
    'Other': [
      'Proof of purchase or service agreement',
      'Evidence of the issue occurring (photos, screenshots)',
      'All communication with the company',
      'Timeline of events',
    ],
  },

  // ── Regulator filing links by issue_type ──────────────────────────────
  regulators: {
    'Flight Cancelled': {
      primary: { name: 'DGCA AirSewa', url: 'https://airsewa.gov.in', helpline: '1800-11-1135', desc: 'File directly with India\'s aviation regulator' },
      secondary: { name: 'National Consumer Helpline', url: 'https://consumerhelpline.gov.in', helpline: '1800-11-4000', desc: 'INGRAM — escalate to consumer forum' },
    },
    'Refund Delay': {
      primary: { name: 'National Consumer Helpline', url: 'https://consumerhelpline.gov.in', helpline: '1800-11-4000', desc: 'INGRAM portal — free, fast, effective' },
      secondary: { name: 'Consumer Forum (NCDRC)', url: 'https://edaakhil.nic.in', desc: 'File e-Daakhil complaint online' },
    },
    'Wrong Product': {
      primary: { name: 'National Consumer Helpline', url: 'https://consumerhelpline.gov.in', helpline: '1800-11-4000', desc: 'INGRAM portal' },
      secondary: { name: 'Consumer Forum (NCDRC)', url: 'https://edaakhil.nic.in', desc: 'File e-Daakhil complaint online' },
    },
    'Return Rejected': {
      primary: { name: 'National Consumer Helpline', url: 'https://consumerhelpline.gov.in', helpline: '1800-11-4000', desc: 'INGRAM portal — e-commerce complaints resolved quickly here' },
      secondary: { name: 'Consumer Forum (NCDRC)', url: 'https://edaakhil.nic.in', desc: 'File e-Daakhil complaint online' },
    },
    'No Support Response': {
      primary: { name: 'National Consumer Helpline', url: 'https://consumerhelpline.gov.in', helpline: '1800-11-4000', desc: 'INGRAM portal' },
      secondary: { name: 'Consumer Forum (NCDRC)', url: 'https://edaakhil.nic.in', desc: 'File e-Daakhil complaint online' },
    },
    'Billing Error': {
      primary: { name: 'National Consumer Helpline', url: 'https://consumerhelpline.gov.in', helpline: '1800-11-4000', desc: 'INGRAM portal' },
      secondary: { name: 'RBI Ombudsman', url: 'https://cms.rbi.org.in', desc: 'For bank/payment billing errors' },
    },
    'Food Delivery Issue': {
      primary: { name: 'National Consumer Helpline', url: 'https://consumerhelpline.gov.in', helpline: '1800-11-4000', desc: 'INGRAM portal' },
      secondary: { name: 'FSSAI (food safety issues)', url: 'https://foscos.fssai.gov.in', helpline: '1800-11-2100', desc: 'Only for food safety / illness complaints' },
    },
    'Other': {
      primary: { name: 'National Consumer Helpline', url: 'https://consumerhelpline.gov.in', helpline: '1800-11-4000', desc: 'INGRAM portal — works for most consumer disputes' },
      secondary: { name: 'Consumer Forum (NCDRC)', url: 'https://edaakhil.nic.in', desc: 'File e-Daakhil complaint online' },
    },
  },
};

// Normalise company name for lookup
window.RESOLVE_DATA.findContact = function(companyName) {
  if (!companyName || companyName === 'Unknown') return null;
  const key = companyName.toLowerCase()
    .replace(/\s+(airlines?|airways?|pvt|ltd|limited|india|technologies?|payments?|digital)\b/g, '')
    .trim();
  const data = window.RESOLVE_DATA.contacts;
  if (data[key]) return data[key];
  // Partial match fallback
  for (const k of Object.keys(data)) {
    if (key.includes(k) || k.includes(key)) return data[k];
  }
  return null;
};
