const SiteSettings = require("../models/SiteSettings");

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
    res.json(doc);
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

    await doc.save();
    res.json(doc);
  } catch (err) {
    console.error("updateSettings error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Public - Get registrations & affiliations
exports.getRegistrationsAffiliations = async (req, res) => {
  try {
    const doc = await getSingleton();
    res.json(doc.registrationsAffiliations || []);
  } catch (err) {
    console.error("getRegistrationsAffiliations error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin/Superadmin - Upload/update document
exports.updateRegistrationDocument = async (req, res) => {
  try {
    const { code } = req.params;
    const { title, description, documentUrl, documentType, status } = req.body;

    const doc = await getSingleton();
    const docIndex = doc.registrationsAffiliations.findIndex((d) => d.code === code);

    if (docIndex === -1) {
      return res.status(404).json({ message: "Document not found" });
    }

    const entry = doc.registrationsAffiliations[docIndex];
    if (typeof title === "string") {
      if (!title.trim()) return res.status(400).json({ message: "Title is required" });
      entry.title = title.trim();
    }
    if (typeof description === "string") entry.description = description.trim();
    // Allow clearing the URL with an empty string.
    if (typeof documentUrl === "string") entry.documentUrl = documentUrl.trim();
    if (DOCUMENT_TYPES.has(documentType)) entry.documentType = documentType;
    if (DOCUMENT_STATUSES.has(status)) entry.status = status;
    entry.uploadedAt = new Date();

    await doc.save();
    res.json(doc.registrationsAffiliations[docIndex]);
  } catch (err) {
    console.error("updateRegistrationDocument error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin/Superadmin - Add new document
const DOCUMENT_TYPES = new Set(["image", "pdf"]);
const DOCUMENT_STATUSES = new Set(["placeholder", "pending", "uploaded"]);

exports.addRegistrationDocument = async (req, res) => {
  try {
    const { title, code, description, documentUrl, documentType, status } = req.body;

    if (!title || !code) {
      return res.status(400).json({ message: "Title and code are required" });
    }

    const doc = await getSingleton();
    
    // Check if code already exists
    if (doc.registrationsAffiliations.some((d) => d.code === code)) {
      return res.status(400).json({ message: "Document code already exists" });
    }

    doc.registrationsAffiliations.push({
      title,
      code,
      description: description || "",
      documentUrl: typeof documentUrl === "string" ? documentUrl.trim() : "",
      documentType: DOCUMENT_TYPES.has(documentType) ? documentType : "image",
      status: DOCUMENT_STATUSES.has(status) ? status : "placeholder",
      uploadedAt: documentUrl ? new Date() : null,
    });

    await doc.save();
    res.json(doc.registrationsAffiliations[doc.registrationsAffiliations.length - 1]);
  } catch (err) {
    console.error("addRegistrationDocument error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin/Superadmin - Delete document
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

