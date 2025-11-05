import axios from "axios";

// ✅ Correct Base URL
const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/treks`;

/**
 * 🔹 Fetch all Trek Packages (public)
 */
export const getAllTrekPackages = async () => {
  const res = await axios.get(BASE_URL);
  return res.data;
};

/**
 * 🔹 Get Trek Package by ID
 */
export const getTrekPackageById = async (id) => {
  const res = await axios.get(`${BASE_URL}/${id}`);
  return res.data;
};

/**
 * 🔹 Create Trek Package (Admin/Superadmin only)
 */
export const createTrekPackage = async (data, token) => {
  const res = await axios.post(BASE_URL, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * 🔹 Update Trek Package (Admin/Superadmin only)
 */
export const updateTrekPackage = async (id, data, token) => {
  const res = await axios.put(`${BASE_URL}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * 🔹 Delete Trek Package (Admin/Superadmin only)
 */
export const deleteTrekPackage = async (id, token) => {
  const res = await axios.delete(`${BASE_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
