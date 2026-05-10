import { geminiModel } from "../../config/gemini";
import { prisma } from "../../config/database";
import { AppError } from "../../errors/AppErrors";

export class AIService {
  // 1. AI Meal Recommender
  async getMealRecommendations(customerId: string) {
    const orderHistory = await prisma.order.findMany({
      where: { customerId, status: "DELIVERED" },
      include: {
        items: {
          include: {
            meal: {
              select: {
                title: true,
                tags: true,
                category: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    if (orderHistory.length === 0) {
      throw new AppError("No order history found to generate recommendations", 400);
    }

    const availableMeals = await prisma.meal.findMany({
      where: { isAvailable: true },
      include: {
        category: { select: { name: true } },
        provider: { select: { shopName: true, isOpen: true } },
      },
      take: 50,
    });

    const orderedItems = orderHistory.flatMap((order) =>
      order.items.map((item) => ({
        title: item.meal.title,
        category: item.meal.category.name,
        tags: item.meal.tags,
      }))
    );

    const prompt = `
You are a food recommendation AI for MeowMeal food delivery app in Bangladesh.

Customer order history:
${JSON.stringify(orderedItems, null, 2)}

Available meals:
${JSON.stringify(
  availableMeals.map((m) => ({
    id: m.id,
    title: m.title,
    category: m.category.name,
    price: m.price,
    tags: m.tags,
    provider: m.provider.shopName,
  })),
  null,
  2
)}

Based on the customer's taste preferences, recommend exactly 4 meals from the available list.
Respond ONLY with a valid JSON array. No explanation, no markdown, no extra text.
Format:
[
  {
    "id": "meal_id",
    "title": "meal title",
    "reason": "why this is recommended in one sentence"
  }
]
`;

    try {
      const result = await geminiModel.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/```json|```/g, "").trim();
      const recommendations = JSON.parse(cleaned);

      const recommendedMeals = await prisma.meal.findMany({
        where: { id: { in: recommendations.map((r: any) => r.id) } },
        include: {
          category: { select: { id: true, name: true } },
          provider: { select: { id: true, shopName: true, logo: true } },
        },
      });

      return recommendedMeals.map((meal) => ({
        ...meal,
        reason: recommendations.find((r: any) => r.id === meal.id)?.reason || "",
      }));
    } catch {
      throw new AppError("Failed to generate recommendations", 500);
    }
  }

  // 2. AI Food Chatbot — DB থেকে real data নিয়ে answer করে
  async chat(message: string, conversationHistory: any[]) {
    // Real data from DB
    const [meals, categories, providers] = await Promise.all([
      prisma.meal.findMany({
        where: { isAvailable: true },
        select: {
          title: true,
          price: true,
          tags: true,
          prepTime: true,
          description: true,
          category: { select: { name: true } },
          provider: { select: { shopName: true, city: true, isOpen: true } },
        },
        take: 30,
      }),
      prisma.category.findMany({
        where: { isActive: true },
        select: { name: true },
      }),
      prisma.providerProfile.findMany({
        select: { shopName: true, city: true, isOpen: true, description: true },
        take: 20,
      }),
    ]);

    const systemPrompt = `You are MeowMeal AI, a helpful food assistant for MeowMeal food delivery app in Bangladesh.

REAL DATA FROM OUR PLATFORM:

Available Meals (${meals.length} total):
${JSON.stringify(
  meals.map((m) => ({
    name: m.title,
    price: `৳${m.price}`,
    category: m.category.name,
    prepTime: `${m.prepTime} min`,
    tags: m.tags,
    description: m.description,
    restaurant: m.provider.shopName,
    city: m.provider.city,
    restaurantOpen: m.provider.isOpen ? "Open" : "Closed",
  })),
  null,
  2
)}

Available Categories: ${categories.map((c) => c.name).join(", ")}

All Restaurants:
${JSON.stringify(
  providers.map((p) => ({
    name: p.shopName,
    city: p.city,
    status: p.isOpen ? "Open" : "Closed",
    description: p.description,
  })),
  null,
  2
)}

INSTRUCTIONS:
- Always answer based on the REAL DATA above only
- If asked about meals, suggest from the actual available meals listed above
- If asked about restaurants, mention actual restaurants from the list
- If asked how many meals/restaurants, count from the real data
- Be friendly and concise (under 150 words)
- Respond in the same language the user writes in (Bengali or English)
- If something is not in our platform, say so honestly
- Do NOT make up meals or restaurants that are not listed above
- Help with food recommendations, dietary questions, order guidance

ORDER HELP:
- To cancel an order: Go to Dashboard → My Orders → click the order → Cancel Order button (only PLACED orders can be cancelled)
- To track an order: Go to Dashboard → My Orders → check the status
- Payment method: Cash on Delivery only
- Delivery: Restaurants deliver to your address
- For other issues: Contact support at support@meowmeal.com`;

    const history = conversationHistory
      .map((msg: any) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n");

    const prompt = `${systemPrompt}

Conversation history:
${history}

User: ${message}
Assistant:`;

    try {
      const result = await geminiModel.generateContent(prompt);
      const response = result.response.text().trim();
      return { message: response };
    } catch {
      throw new AppError("Failed to generate chat response", 500);
    }
  }

  // 3. AI Menu Description Generator
  async generateMenuDescription(input: {
    title: string;
    ingredients?: string;
    cuisine?: string;
    spiceLevel?: string;
  }) {
    const prompt = `
You are a professional food copywriter for MeowMeal food delivery app.

Generate an appetizing meal description for:
- Meal name: ${input.title}
- Cuisine type: ${input.cuisine || "Not specified"}
- Key ingredients: ${input.ingredients || "Not specified"}
- Spice level: ${input.spiceLevel || "Medium"}

Respond ONLY with a valid JSON object. No markdown, no extra text.
Format:
{
  "description": "appetizing description in 2-3 sentences",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "spiceLevel": "mild/medium/hot/very hot"
}
`;

    try {
      const result = await geminiModel.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/```json|```/g, "").trim();
      const generated = JSON.parse(cleaned);
      return generated;
    } catch {
      throw new AppError("Failed to generate description", 500);
    }
  }

  // 4. AI Review Sentiment Analyzer
  async analyzeReviewSentiment(reviews: { id: string; comment: string; rating: number }[]) {
    if (reviews.length === 0) {
      throw new AppError("No reviews provided", 400);
    }

    const prompt = `
You are a sentiment analysis AI for MeowMeal food delivery app.

Analyze these customer reviews and provide insights:
${JSON.stringify(reviews, null, 2)}

Respond ONLY with a valid JSON object. No markdown, no extra text.
Format:
{
  "overallSentiment": "positive/negative/mixed",
  "positiveCount": 0,
  "negativeCount": 0,
  "neutralCount": 0,
  "commonPraises": ["praise1", "praise2"],
  "commonComplaints": ["complaint1", "complaint2"],
  "suggestions": "one actionable suggestion for the provider",
  "reviewSentiments": [
    {
      "id": "review_id",
      "sentiment": "positive/negative/neutral"
    }
  ]
}
`;

    try {
      const result = await geminiModel.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/```json|```/g, "").trim();
      const analysis = JSON.parse(cleaned);

      for (const item of analysis.reviewSentiments) {
        await prisma.review.update({
          where: { id: item.id },
          data: { sentiment: item.sentiment },
        });
      }

      return analysis;
    } catch {
      throw new AppError("Failed to analyze sentiment", 500);
    }
  }

  // 5. AI Platform Analyzer (Admin only)
  async analyzePlatform() {
    const [
      totalOrders,
      totalRevenue,
      ordersByStatus,
      topMeals,
      recentReviews,
      totalUsers,
      totalProviders,
      monthlyOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        where: { status: "DELIVERED" },
        _sum: { totalAmount: true },
      }),
      prisma.order.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      prisma.orderItem.groupBy({
        by: ["mealId"],
        _count: { mealId: true },
        orderBy: { _count: { mealId: "desc" } },
        take: 5,
      }),
      prisma.review.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        select: { rating: true, comment: true, sentiment: true },
      }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.providerProfile.count(),
      prisma.order.findMany({
        where: {
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        select: { totalAmount: true, status: true, createdAt: true },
      }),
    ]);

    const topMealIds = topMeals.map((m) => m.mealId);
    const topMealDetails = await prisma.meal.findMany({
      where: { id: { in: topMealIds } },
      select: { id: true, title: true, price: true },
    });

    const prompt = `You are an AI business analyst for MeowMeal, a food delivery platform in Bangladesh.

PLATFORM DATA:

Total Customers: ${totalUsers}
Total Restaurants: ${totalProviders}
Total Orders: ${totalOrders}
Total Revenue (Delivered): ৳${totalRevenue._sum.totalAmount || 0}

Order Status Breakdown:
${JSON.stringify(ordersByStatus.map(o => ({ status: o.status, count: o._count.status })), null, 2)}

Top 5 Most Ordered Meals:
${JSON.stringify(topMealDetails.map(m => ({
  name: m.title,
  price: `৳${m.price}`,
  orderCount: topMeals.find(t => t.mealId === m.id)?._count.mealId || 0,
})), null, 2)}

Last 30 Days Orders: ${monthlyOrders.length}
Last 30 Days Revenue: ৳${monthlyOrders.filter(o => o.status === "DELIVERED").reduce((sum, o) => sum + o.totalAmount, 0)}

Recent Reviews Sample (${recentReviews.length} reviews):
Average Rating: ${recentReviews.length > 0 ? (recentReviews.reduce((sum, r) => sum + r.rating, 0) / recentReviews.length).toFixed(1) : "N/A"}
Sentiment: ${recentReviews.filter(r => r.sentiment === "positive").length} positive, ${recentReviews.filter(r => r.sentiment === "negative").length} negative, ${recentReviews.filter(r => r.sentiment === "neutral").length} neutral

Analyze this data and provide actionable business insights.
Respond ONLY with a valid JSON object. No markdown, no extra text.
Format:
{
  "overallHealth": "excellent/good/fair/poor",
  "healthScore": 85,
  "keyMetrics": {
    "conversionRate": "description",
    "avgOrderValue": "৳amount",
    "customerSatisfaction": "percentage or description"
  },
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "opportunities": ["opportunity1", "opportunity2"],
  "recommendations": [
    {
      "priority": "high/medium/low",
      "action": "what to do",
      "impact": "expected impact"
    }
  ],
  "summary": "2-3 sentence executive summary"
}`;

    try {
      const result = await geminiModel.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/```json|```/g, "").trim();
      const analysis = JSON.parse(cleaned);
      return analysis;
    } catch {
      throw new AppError("Failed to analyze platform data", 500);
    }
  }
}