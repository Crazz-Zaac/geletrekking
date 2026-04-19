const { getRiskStoreHealth } = require("../config/riskStore");

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
