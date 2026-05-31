import api from "./api";

const subscriptionService = {
  // ===========================
  // GET CURRENT USER'S SUBSCRIPTIONS
  // ===========================
  getAllSubscriptions: async () => {
    const response = await api.get("/subscription");
    return response;
  },

  // ===========================
  // GET USER'S SUBSCRIPTIONS
  // ===========================
  getUserSubscriptions: async () => {
    const response = await api.get("/subscription");
    return response;
  },

  // ===========================
  // GET SINGLE SUBSCRIPTION
  // ===========================
  getSubscription: async (id) => {
    const response = await api.get(`/subscription/${id}`);
    return response;
  },

  // ===========================
  // CREATE NEW SUBSCRIPTION
  // ===========================
  createSubscription: async (subscriptionData) => {
    const response = await api.post("/subscription", subscriptionData);
    return response;
  },

  // ===========================
  // UPDATE SUBSCRIPTION
  // ===========================
  updateSubscription: async (id, subscriptionData) => {
    const response = await api.patch(`/subscription/${id}`, subscriptionData);
    return response;
  },

  // ===========================
  // DELETE CURRENT USER'S SUBSCRIPTION
  // ===========================
  deleteSubscription: async (id) => {
    const response = await api.delete(`/subscription/${id}`);
    return response;
  },

  // ===========================
  // CANCEL SUBSCRIPTION
  // ===========================
  cancelSubscription: async (id) => {
    const response = await api.patch(`/subscription/${id}/cancel`);
    return response;
  },

  // ===========================
  // GET UPCOMING RENEWALS (next 7 days)
  // ===========================
  getUpcomingRenewals: async () => {
    const response = await api.get("/subscription/upcoming");
    return response;
  },

  // ===========================
  // SEARCH & FILTER SUBSCRIPTIONS
  // ===========================
  searchSubscriptions: async (filters) => {
    // Build query string from filters object
    const queryParams = new URLSearchParams();

    if (filters.name) queryParams.append("name", filters.name);
    if (filters.category) queryParams.append("category", filters.category);
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
    if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);

    const response = await api.get(
      `/subscription/search/filter?${queryParams.toString()}`,
    );
    return response;
  },

  // ===========================
  // EXPORT SUBSCRIPTIONS (CSV/JSON)
  // ===========================
  exportSubscriptions: async (format = "json") => {
    const response = await api.get(`/subscription/export?format=${format}`);
    return response;
  },
};

export default subscriptionService;
