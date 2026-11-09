const SiteSettings = require("../models/SiteSettings");
const { getWatermarkedImage } = require("../utils/watermark");

const defaultDocuments = [
  {
    title: "Company Registration Certificate",
    code: "DOC-01",
    description: "Official company registration issued by the relevant authority.",
    documentUrl: "",
    documentType: "image",
    status: "placeholder",
    uploadedAt: null,
  },
  {
    title: "PAN / Tax Registration",
    code: "DOC-02",
    description: "Tax and PAN registration document for legal business operations.",
    documentUrl: "",
    documentType: "image",
    status: "placeholder",
    uploadedAt: null,
  },
  {
    title: "Nepal Tourism Board Affiliation",
    code: "DOC-03",
    description: "Affiliation and authorization record with Nepal Tourism Board.",
    documentUrl: "",
    documentType: "image",
    status: "placeholder",
    uploadedAt: null,
  },
  {
    title: "TAAN Membership Certificate",
    code: "DOC-04",
    description: "Trekking Agencies' Association of Nepal membership proof.",
    documentUrl: "",
    documentType: "image",
    status: "placeholder",
    uploadedAt: null,
  },
  {
    title: "NMA Affiliation Certificate",
    code: "DOC-05",
    description: "Nepal Mountaineering Association affiliation document.",
    documentUrl: "",
    documentType: "image",
    status: "placeholder",
    uploadedAt: null,
  },
  {
    title: "Local Government Trade License",
    code: "DOC-06",
    description: "Valid municipal/local government trade operation license.",
    documentUrl: "",
    documentType: "image",
    status: "placeholder",
    uploadedAt: null,
  },
];

async function getSingleton() {
  let doc = await SiteSettings.findOne();
  if (!doc) {
    doc = await SiteSettings.create({
      registrationsAffiliations: defaultDocuments,
    });
  } else if (!doc.registrationsAffiliations || doc.registrationsAffiliations.length === 0) {
    doc.registrationsAffiliations = defaultDocuments;
    await doc.save();
  }
  return doc;
}


// Public
exports.getSettings = async (req, res) => {
  try {
    const doc = await getSingleton();
    // Document files are served (watermarked) by the registrations endpoints only.
    const { registrationsAffiliations, ...publicSettings } = doc.toObject();
    res.json(publicSettings);
  } catch (err) {
    console.error("getSettings error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin/Superadmin
exports.updateSettings = async (req, res) => {
  try {
    const doc = await getSingleton();

    const allowed = [
      "siteName",
      "logoUrl",
      "contactHeroImageUrl",
      "bookingHeroImageUrl",
      "phone",
      "email",
      "address",
      "officeHoursWeekdays",
      "officeHoursWeekend",
      "mapEmbedUrl",
      "navigation",
      "social",
    ];

    for (const key of allowed) {
      if (typeof req.body[key] !== "undefined") doc[key] = req.body[key];
    }

    // Extra contact emails: up to 5, each with a valid address.
    if (Array.isArray(req.body.contactEmails)) {
      const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      const cleaned = req.body.contactEmails
        .map((item) => ({
          label: String(item?.label || "").trim().slice(0, 40),
          email: String(item?.email || "").trim().toLowerCase().slice(0, 254),
          note: String(item?.note || "").trim().slice(0, 120),
        }))
        .filter((item) => item.email);
      const invalid = cleaned.find((item) => !EMAIL_RE.test(item.email));
      if (invalid) return res.status(400).json({ message: `Invalid email address: ${invalid.email}` });
      doc.contactEmails = cleaned.slice(0, 5);
    }

    await doc.save();
    res.json(doc);
  } catch (err) {
    console.error("updateSettings error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admins manage activities, so they may also show or hide them in the site menu.
// This changes only that one setting; everything else still needs manage_settings.
exports.updateActivitiesVisibility = async (req, res) => {
  try {
    if (typeof req.body?.enabled !== "boolean") {
      return res.status(400).json({ message: "enabled must be true or false" });
    }
    const doc = await getSingleton();
    doc.set("navigation.activitiesEnabled", req.body.enabled);
    await doc.save();
    const { registrationsAffiliations, ...publicSettings } = doc.toObject();
    res.json(publicSettings);
  } catch (err) {
    console.error("updateActivitiesVisibility error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---- Registrations & affiliations ----
const DOCUMENT_TYPES = new Set(["image", "pdf"]);
const DOCUMENT_STATUSES = new Set(["placeholder", "pending", "uploaded"]);
const DOCUMENT_KINDS = new Set(["registration", "membership"]);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const HTTPS_RE = /^https:\/\/[^\s]+$/i;

const cleanText = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) : undefined);
const cleanDate = (value) => (typeof value === "string" ? (DATE_RE.test(value.trim()) ? value.trim() : "") : undefined);
const cleanHttps = (value) => (typeof value === "string" ? (HTTPS_RE.test(value.trim()) ? value.trim() : "") : undefined);

/** Copies the optional detail fields from a request body onto `entry` (only those present). */
const applyDocumentDetails = (entry, body) => {
  const fields = {
    description: cleanText(body.description, 600),
    issuer: cleanText(body.issuer, 160),
    referenceNumber: cleanText(body.referenceNumber, 80),
    issuedOn: cleanDate(body.issuedOn),
    validUntil: cleanDate(body.validUntil),
    verifyUrl: cleanHttps(body.verifyUrl),
    logoUrl: cleanHttps(body.logoUrl),
  };
  for (const [key, value] of Object.entries(fields)) if (value !== undefined) entry[key] = value;
  if (typeof body.documentUrl === "string") entry.documentUrl = cleanHttps(body.documentUrl);
  if (DOCUMENT_TYPES.has(body.documentType)) entry.documentType = body.documentType;
  if (DOCUMENT_STATUSES.has(body.status)) entry.status = body.status;
  if (DOCUMENT_KINDS.has(body.kind)) entry.kind = body.kind;
};

/**
 * What visitors get. The original file link is never sent for images: they are
 * served watermarked through /registrations-affiliations/:code/preview instead.
 * Hidden ("placeholder") entries are left out.
 */
const toPublicDocument = (doc) => {
  const hasFile = doc.status === "uploaded" && Boolean(doc.documentUrl);
  const base = `/api/settings/registrations-affiliations/${encodeURIComponent(doc.code)}/preview`;
  const version = doc.uploadedAt ? new Date(doc.uploadedAt).getTime() : 0;
  return {
    code: doc.code,
    title: doc.title,
    description: doc.description || "",
    kind: doc.kind || "registration",
    issuer: doc.issuer || "",
    referenceNumber: doc.referenceNumber || "",
    issuedOn: doc.issuedOn || "",
    validUntil: doc.validUntil || "",
    verifyUrl: doc.verifyUrl || "",
    logoUrl: doc.logoUrl || "",
    status: doc.status,
    documentType: doc.documentType,
    hasFile,
    previewUrl: hasFile && doc.documentType === "image" ? `${base}?size=thumb&v=${version}` : "",
    fullUrl: hasFile && doc.documentType === "image" ? `${base}?size=full&v=${version}` : "",
    // PDFs can't be watermarked here, so they are linked as uploaded.
    pdfUrl: hasFile && doc.documentType === "pdf" ? doc.documentUrl : "",
  };
};

// Public - registrations & affiliations (visible entries, no original image links)
exports.getRegistrationsAffiliations = async (req, res) => {
  try {
    const doc = await getSingleton();
    const items = (doc.registrationsAffiliations || [])
      .filter((item) => item.status !== "placeholder")
      .map(toPublicDocument);
    res.set("Cache-Control", "public, max-age=300");
    res.json(items);
  } catch (err) {
    console.error("getRegistrationsAffiliations error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin - full list including original file links and hidden entries
exports.getRegistrationsAffiliationsAdmin = async (req, res) => {
  try {
    const doc = await getSingleton();
    res.set("Cache-Control", "no-store");
    res.json(doc.registrationsAffiliations || []);
  } catch (err) {
    console.error("getRegistrationsAffiliationsAdmin error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Public - watermarked certificate image
exports.getRegistrationPreview = async (req, res) => {
  try {
    const doc = await getSingleton();
    const entry = (doc.registrationsAffiliations || []).find((item) => item.code === req.params.code);
    if (!entry || entry.status !== "uploaded" || entry.documentType !== "image" || !entry.documentUrl) {
      return res.status(404).json({ message: "Not found" });
    }
    const size = req.query.size === "full" ? "full" : "thumb";
    const image = await getWatermarkedImage(entry.documentUrl, size);
    res.set({
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=86400",
      "X-Robots-Tag": "noimageindex",
      "Content-Disposition": "inline",
    });
    res.send(image);
  } catch (err) {
    console.error("getRegistrationPreview error:", err.message);
    res.status(502).json({ message: "Could not load the document" });
  }
};

// Admin/Superadmin - update document
exports.updateRegistrationDocument = async (req, res) => {
  try {
    const { code } = req.params;
    const doc = await getSingleton();
    const docIndex = doc.registrationsAffiliations.findIndex((d) => d.code === code);
    if (docIndex === -1) {
      return res.status(404).json({ message: "Document not found" });
    }

    const entry = doc.registrationsAffiliations[docIndex];
    if (typeof req.body.title === "string") {
      if (!req.body.title.trim()) return res.status(400).json({ message: "Title is required" });
      entry.title = req.body.title.trim().slice(0, 160);
    }
    const previousUrl = entry.documentUrl;
    applyDocumentDetails(entry, req.body);
    if (entry.documentUrl !== previousUrl || !entry.uploadedAt) entry.uploadedAt = new Date();

    await doc.save();
    res.json(doc.registrationsAffiliations[docIndex]);
  } catch (err) {
    console.error("updateRegistrationDocument error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin/Superadmin - add document
exports.addRegistrationDocument = async (req, res) => {
  try {
    const title = cleanText(req.body.title, 160);
    const code = cleanText(req.body.code, 40);
    if (!title || !code) {
      return res.status(400).json({ message: "Title and code are required" });
    }
    if (!/^[A-Z0-9_-]+$/i.test(code)) {
      return res.status(400).json({ message: "Code can only contain letters, numbers, - and _" });
    }

    const doc = await getSingleton();
    if (doc.registrationsAffiliations.some((d) => d.code === code)) {
      return res.status(400).json({ message: "Document code already exists" });
    }

    const entry = { title, code, description: "", documentUrl: "", documentType: "image", status: "placeholder", kind: "registration" };
    applyDocumentDetails(entry, req.body);
    entry.uploadedAt = entry.documentUrl ? new Date() : null;
    doc.registrationsAffiliations.push(entry);

    await doc.save();
    res.json(doc.registrationsAffiliations[doc.registrationsAffiliations.length - 1]);
  } catch (err) {
    console.error("addRegistrationDocument error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteRegistrationDocument = async (req, res) => {
  try {
    const { code } = req.params;

    const doc = await getSingleton();
    const docIndex = doc.registrationsAffiliations.findIndex((d) => d.code === code);

    if (docIndex === -1) {
      return res.status(404).json({ message: "Document not found" });
    }

    doc.registrationsAffiliations.splice(docIndex, 1);
    await doc.save();

    res.json({ message: "Document deleted successfully" });
  } catch (err) {
    console.error("deleteRegistrationDocument error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

