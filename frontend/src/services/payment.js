import api from "./api";

const paymentService = {
  // ===========================
  // CREATE STRIPE CHECKOUT SESSION
  // ===========================
  createCheckoutSession: async (planData) => {
    const response = await api.post("/payment/checkout", planData);
    return response;
  },

  // ===========================
  // VERIFY PAYMENT
  // ===========================
  verifyPayment: async (sessionId) => {
    const response = await api.get(`/payment/verify/${sessionId}`);
    return response;
  },

  // ===========================
  // GET PAYMENT HISTORY
  // ===========================
  getPaymentHistory: async () => {
    const response = await api.get("/payment/history");
    return response;
  },
};

export default paymentService;
