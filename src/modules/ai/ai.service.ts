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
      throw new AppError(
        "No order history found to generate recommendations",
        400
      );
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
        where: {
          id: { in: recommendations.map((r: any) => r.id) },
        },
        include: {
          category: { select: { id: true, name: true } },
          provider: { select: { id: true, shopName: true, logo: true } },
        },
      });

      return recommendedMeals.map((meal) => ({
        ...meal,
        reason:
          recommendations.find((r: any) => r.id === meal.id)?.reason || "",
      }));
    } catch {
      throw new AppError("Failed to generate recommendations", 500);
    }
  }

  // 2. AI Food Chatbot
  async chat(message: string, conversationHistory: any[]) {
    const systemPrompt = `You are a helpful food assistant for MeowMeal, a food delivery app in Bangladesh.
You help customers with finding meals, food recommendations, dietary advice, and order questions.
Be friendly, concise, and helpful. Keep responses under 150 words.
If asked about something unrelated to food, politely redirect.`;

    const history = conversationHistory
      .map(
        (msg: any) =>
          `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
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

      // update each review sentiment in db
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
}