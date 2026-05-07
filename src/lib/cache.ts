import NodeCache from "node-cache";

// 5 minutes TTL by default
export const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

export const cacheKeys = {
  allCategories: "all_categories",
  allMeals: (page: number, limit: number, query: string) =>
    `meals_${page}_${limit}_${query}`,
  mealById: (id: string) => `meal_${id}`,
  allProviders: (page: number, limit: number) =>
    `providers_${page}_${limit}`,
  adminStats: "admin_stats",
  providerStats: (userId: string) => `provider_stats_${userId}`,
};

export const getOrSetCache = async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> => {
  const cached = cache.get<T>(key);

  if (cached !== undefined) {
    return cached;
  }

  const data = await fetchFn();

  if (ttl) {
    cache.set(key, data, ttl);
  } else {
    cache.set(key, data);
  }

  return data;
};