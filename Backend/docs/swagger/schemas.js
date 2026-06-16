export const schemas = {
  ErrorResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      message: { oneOf: [{ type: "string" }, { type: "array" }] },
      error: { oneOf: [{ type: "string" }, { type: "array" }] },
    },
  },
  MessageResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Operation completed successfully" },
    },
  },
  User: {
    type: "object",
    properties: {
      _id: { type: "string", example: "665f1b9a4f9b2a001f0c1234" },
      name: { type: "string", example: "Khansa Ehsan" },
      email: { type: "string", format: "email", example: "khansa@example.com" },
      role: { type: "string", enum: ["user", "admin"], example: "user" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  UserEnvelope: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/User" },
        },
      },
    },
  },
  AuthResponse: {
    allOf: [
      { $ref: "#/components/schemas/UserEnvelope" },
      {
        type: "object",
        properties: {
          message: { type: "string", example: "User logged in successfully" },
        },
      },
    ],
  },
  SignupInput: {
    type: "object",
    required: ["name", "email", "password"],
    properties: {
      name: { type: "string", minLength: 3, maxLength: 30, example: "Khansa" },
      email: { type: "string", format: "email", example: "khansa@example.com" },
      password: { type: "string", minLength: 8, example: "Password123" },
    },
  },
  LoginInput: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email", example: "khansa@example.com" },
      password: { type: "string", minLength: 8, example: "Password123" },
    },
  },
  ForgotPasswordInput: {
    type: "object",
    required: ["email"],
    properties: {
      email: { type: "string", format: "email", example: "khansa@example.com" },
    },
  },
  ResetPasswordInput: {
    type: "object",
    required: ["password"],
    properties: {
      password: { type: "string", minLength: 8, example: "NewPassword123" },
    },
  },
  VerifyResetTokenResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: {
        type: "string",
        example: "Token is valid. You can reset your password.",
      },
      email: { type: "string", format: "email", example: "khansa@example.com" },
      name: { type: "string", example: "Khansa" },
    },
  },
  UpdateProfileInput: {
    type: "object",
    properties: {
      name: { type: "string", minLength: 3, maxLength: 30, example: "Khansa" },
      email: { type: "string", format: "email", example: "khansa@example.com" },
    },
  },
  ChangePasswordInput: {
    type: "object",
    required: ["currentPassword", "password"],
    properties: {
      currentPassword: { type: "string", example: "Password123" },
      password: { type: "string", minLength: 8, example: "NewPassword123" },
    },
  },
  Subscription: {
    type: "object",
    properties: {
      _id: { type: "string", example: "665f1b9a4f9b2a001f0c4567" },
      name: { type: "string", example: "Netflix" },
      price: { type: "number", example: 15.99 },
      currency: { type: "string", enum: ["USD", "EUR", "GBP"], example: "USD" },
      frequency: {
        type: "string",
        enum: ["daily", "weekly", "monthly", "yearly"],
        example: "monthly",
      },
      category: {
        type: "string",
        enum: [
          "drama",
          "films",
          "horror",
          "news",
          "sports",
          "entertainment",
          "policies",
          "technology",
          "other",
        ],
        example: "entertainment",
      },
      paymentMethod: { type: "string", example: "Credit Card" },
      status: {
        type: "string",
        enum: ["active", "cancelled", "expired"],
        example: "active",
      },
      startDate: { type: "string", format: "date", example: "2026-05-01" },
      renewalDate: { type: "string", format: "date-time" },
      user: { oneOf: [{ type: "string" }, { $ref: "#/components/schemas/User" }] },
      stripeCheckoutSessionId: { type: "string", nullable: true },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  SubscriptionInput: {
    type: "object",
    required: ["name", "price", "frequency", "category", "paymentMethod", "startDate"],
    properties: {
      name: { type: "string", minLength: 3, maxLength: 100, example: "Netflix" },
      price: { type: "number", minimum: 0.01, example: 15.99 },
      currency: { type: "string", enum: ["USD", "EUR", "GBP"], example: "USD" },
      frequency: {
        type: "string",
        enum: ["daily", "weekly", "monthly", "yearly"],
        example: "monthly",
      },
      category: { type: "string", example: "entertainment" },
      paymentMethod: { type: "string", example: "Credit Card" },
      status: {
        type: "string",
        enum: ["active", "cancelled", "expired"],
        example: "active",
      },
      startDate: { type: "string", format: "date", example: "2026-05-01" },
      renewalDate: { type: "string", format: "date", example: "2026-06-01" },
    },
  },
  SubscriptionUpdateInput: {
    type: "object",
    properties: {
      name: { type: "string", minLength: 3, maxLength: 100, example: "Netflix" },
      price: { type: "number", minimum: 0.01, example: 17.99 },
      currency: { type: "string", enum: ["USD", "EUR", "GBP"], example: "USD" },
      frequency: {
        type: "string",
        enum: ["daily", "weekly", "monthly", "yearly"],
        example: "monthly",
      },
      category: { type: "string", example: "entertainment" },
      paymentMethod: { type: "string", example: "Credit Card" },
      status: {
        type: "string",
        enum: ["active", "cancelled", "expired"],
        example: "active",
      },
      startDate: { type: "string", format: "date", example: "2026-05-01" },
      renewalDate: { type: "string", format: "date", example: "2026-06-01" },
    },
  },
  CheckoutInput: {
    type: "object",
    required: ["name", "price", "frequency", "category", "startDate"],
    properties: {
      name: { type: "string", minLength: 3, maxLength: 100, example: "Netflix" },
      price: { type: "number", minimum: 0.01, example: 15.99 },
      currency: { type: "string", enum: ["USD", "EUR", "GBP"], example: "USD" },
      frequency: {
        type: "string",
        enum: ["daily", "weekly", "monthly", "yearly"],
        example: "monthly",
      },
      category: { type: "string", example: "entertainment" },
      startDate: { type: "string", format: "date", example: "2026-05-01" },
      renewalDate: { type: "string", format: "date", example: "2026-06-01" },
    },
  },
  SubscriptionListResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      count: { type: "number", example: 1 },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/Subscription" },
      },
    },
  },
  SubscriptionEnvelope: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        oneOf: [
          { $ref: "#/components/schemas/Subscription" },
          {
            type: "object",
            properties: {
              subscription: { $ref: "#/components/schemas/Subscription" },
              workflowRunId: { type: "string", nullable: true },
            },
          },
        ],
      },
    },
  },
  CheckoutResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      url: { type: "string", format: "uri" },
      sessionId: { type: "string", example: "cs_test_a1b2c3" },
    },
  },
  MonthlyAnalyticsResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "array",
        items: {
          type: "object",
          properties: {
            _id: {
              type: "object",
              properties: {
                year: { type: "number", example: 2026 },
                month: { type: "number", example: 5 },
              },
            },
            totalSpend: { type: "number", example: 45.98 },
          },
        },
      },
    },
  },
  ActionCenterResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "object",
        properties: {
          summary: {
            type: "object",
            properties: {
              totalSubscriptions: { type: "number", example: 6 },
              activeSubscriptions: { type: "number", example: 5 },
              estimatedMonthlySpend: { type: "number", example: 79.97 },
              upcomingRenewalsCount: { type: "number", example: 2 },
              overdueRenewalsCount: { type: "number", example: 0 },
            },
          },
          upcomingRenewals: {
            type: "object",
            properties: {
              next7Days: {
                type: "array",
                items: { $ref: "#/components/schemas/ActionRenewalItem" },
              },
              next30Days: {
                type: "array",
                items: { $ref: "#/components/schemas/ActionRenewalItem" },
              },
            },
          },
          overdueRenewals: {
            type: "array",
            items: { $ref: "#/components/schemas/ActionRenewalItem" },
          },
          savingsOpportunities: {
            type: "array",
            items: { $ref: "#/components/schemas/SavingsOpportunity" },
          },
          categoryReviews: {
            type: "array",
            items: { $ref: "#/components/schemas/CategoryReview" },
          },
        },
      },
    },
  },
  ActionRenewalItem: {
    type: "object",
    properties: {
      _id: { type: "string", example: "665f1b9a4f9b2a001f0c4567" },
      name: { type: "string", example: "Netflix" },
      price: { type: "number", example: 15.99 },
      currency: { type: "string", example: "USD" },
      frequency: { type: "string", example: "monthly" },
      category: { type: "string", example: "entertainment" },
      renewalDate: { type: "string", format: "date-time" },
      daysUntilRenewal: { type: "number", example: 5 },
    },
  },
  SavingsOpportunity: {
    type: "object",
    properties: {
      _id: { type: "string", example: "665f1b9a4f9b2a001f0c4567" },
      name: { type: "string", example: "Netflix" },
      category: { type: "string", example: "entertainment" },
      monthlyValue: { type: "number", example: 15.99 },
      renewalDate: { type: "string", format: "date-time" },
      reason: { type: "string", example: "Top monthly cost" },
    },
  },
  CategoryReview: {
    type: "object",
    properties: {
      category: { type: "string", example: "entertainment" },
      count: { type: "number", example: 3 },
      estimatedMonthlySpend: { type: "number", example: 49.97 },
      subscriptions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            _id: { type: "string", example: "665f1b9a4f9b2a001f0c4567" },
            name: { type: "string", example: "Netflix" },
            monthlyValue: { type: "number", example: 15.99 },
          },
        },
      },
    },
  },
  AdminDashboardResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: { type: "object" },
    },
  },
  SmartImportCandidate: {
    type: "object",
    properties: {
      _id: { type: "string", example: "665f1b9a4f9b2a001f0c4567" },
      importStatus: { type: "string", example: "pending" },
      duplicate: { type: "boolean", example: false },
      rawSource: { type: "string", example: "Netflix, 15.99, monthly" },
      issues: {
        type: "array",
        items: { type: "string" },
      },
      payload: { $ref: "#/components/schemas/SubscriptionInput" },
    },
  },
  SmartImportEnvelope: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: { $ref: "#/components/schemas/SmartImportCandidate" },
    },
  },
  SmartImportListResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      count: { type: "number", example: 1 },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/SmartImportCandidate" },
      },
    },
  },
  SmartImportConfirmResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "object",
        properties: {
          candidate: { $ref: "#/components/schemas/SmartImportCandidate" },
          subscription: { $ref: "#/components/schemas/Subscription" },
        },
      },
    },
  },
  HealthResponse: {
    type: "object",
    properties: {
      status: { type: "string", example: "success" },
      message: { type: "string", example: "Subscription Tracker API is running" },
      timestamp: { type: "string", format: "date-time" },
      uptime: { type: "number", example: 123.45 },
      environment: { type: "string", example: "development" },
      version: { type: "string", example: "1.0.0" },
    },
  },
  DatabaseHealthResponse: {
    type: "object",
    properties: {
      status: { type: "string", example: "success" },
      database: { type: "string", example: "connected" },
      readyState: { type: "number", example: 1 },
    },
  },
  WorkflowReminderInput: {
    type: "object",
    required: ["subscriptionId"],
    properties: {
      subscriptionId: {
        type: "string",
        example: "665f1b9a4f9b2a001f0c4567",
      },
    },
  },
};
