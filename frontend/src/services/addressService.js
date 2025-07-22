import api from "./api";

// Get user's addresses
export const getUserAddresses = async () => {
  const response = await api.get("/addresses");
  return response.data;
};

// Add new address
export const addAddress = async (addressData) => {
  const response = await api.post("/addresses", addressData);
  return response.data;
};

// Create address (alias for addAddress)
export const createAddress = async (addressData) => {
  const response = await api.post("/addresses", addressData);
  return response.data;
};

// Update address
export const updateAddress = async (addressId, addressData) => {
  const response = await api.put(`/addresses/${addressId}`, addressData);
  return response.data;
};

// Delete address
export const deleteAddress = async (addressId) => {
  const response = await api.delete(`/addresses/${addressId}`);
  return response.data;
};

// Set default address
export const setDefaultAddress = async (addressId) => {
  const response = await api.patch(`/addresses/${addressId}/default`);
  return response.data;
};

const addressService = {
  getUserAddresses,
  addAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};

export default addressService;
