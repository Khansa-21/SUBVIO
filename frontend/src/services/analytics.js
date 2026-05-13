import api from "./api";

const analyticsService = {
  // ===========================
  // GET MONTHLY SPENDING ANALYTICS
  // ===========================
  getMonthlyAnalytics: async () => {
    const response = await api.get("/analytics/monthly");
    return response;
  },

  // ===========================
  // GET SPENDING BY CATEGORY
  // ===========================
  getSpendingByCategory: async () => {
    const response = await api.get("/analytics/category");
    return response;
  },

  // ===========================
  // GET YEARLY SPENDING REPORT
  // ===========================
  getYearlyReport: async (year) => {
    const response = await api.get(
      `/analytics/yearly?year=${year || new Date().getFullYear()}`,
    );
    return response;
  },

  // ===========================
  // GET SPENDING TRENDS
  // ===========================
  getSpendingTrends: async (months = 6) => {
    const response = await api.get(`/analytics/trends?months=${months}`);
    return response;
  },
};

export default analyticsService;
