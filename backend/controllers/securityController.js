const fs = require("fs/promises");
const { X509Certificate } = require("crypto");
const { getRiskStoreHealth } = require("../config/riskStore");

const SSL_CERT_PATH = process.env.SSL_CERT_PATH || "/etc/nginx/certs/fullchain.pem";
const SSL_WARNING_DAYS = Number(process.env.SSL_WARNING_DAYS || 30);

exports.getRiskHealth = async (req, res) => {
  try {
    const health = await getRiskStoreHealth();
    res.status(200).json({
      message: "Risk store health retrieved.",
      ...health,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to read risk store health.",
    });
  }
};

exports.getSslHealth = async (req, res) => {
  const now = new Date();

  try {
    const certPem = await fs.readFile(SSL_CERT_PATH, "utf8");
    const certificate = new X509Certificate(certPem);

    const validFrom = new Date(certificate.validFrom);
    const validTo = new Date(certificate.validTo);
    const msRemaining = validTo.getTime() - now.getTime();
    const daysRemaining = Number((msRemaining / (1000 * 60 * 60 * 24)).toFixed(1));
    const validNow = now >= validFrom && now <= validTo;

    let status = "valid";
    if (!validNow) {
      status = "expired";
    } else if (daysRemaining <= SSL_WARNING_DAYS) {
      status = "expiring-soon";
    }

    res.status(200).json({
      message: "SSL certificate health retrieved.",
      status,
      certPath: SSL_CERT_PATH,
      warningThresholdDays: SSL_WARNING_DAYS,
      validNow,
      validFrom: validFrom.toISOString(),
      validTo: validTo.toISOString(),
      daysRemaining,
      issuer: certificate.issuer,
      subject: certificate.subject,
      serialNumber: certificate.serialNumber,
      fingerprint256: certificate.fingerprint256,
      checkedAt: now.toISOString(),
    });
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return res.status(200).json({
        message: "SSL certificate file not found.",
        status: "missing",
        certPath: SSL_CERT_PATH,
        warningThresholdDays: SSL_WARNING_DAYS,
        validNow: false,
        validFrom: null,
        validTo: null,
        daysRemaining: null,
        issuer: null,
        subject: null,
        serialNumber: null,
        fingerprint256: null,
        checkedAt: now.toISOString(),
      });
    }

    return res.status(200).json({
      message: "Unable to parse SSL certificate.",
      status: "invalid",
      certPath: SSL_CERT_PATH,
      warningThresholdDays: SSL_WARNING_DAYS,
      validNow: false,
      validFrom: null,
      validTo: null,
      daysRemaining: null,
      issuer: null,
      subject: null,
      serialNumber: null,
      fingerprint256: null,
      checkedAt: now.toISOString(),
    });
  }
};
