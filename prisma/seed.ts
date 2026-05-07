import { prisma } from "../src/config/database";
import { auth } from "../src/config/auth";

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.review.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.meal.deleteMany();
  await prisma.providerProfile.deleteMany();
  await prisma.category.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log("Cleaned existing data");

  // Admin
  await auth.api.signUpEmail({
    body: {
      name: "Super Admin",
      email: "admin@meowmeal.com",
      password: "password123",
      role: "ADMIN",
    },
  });
  console.log("Admin created");

  // Customer 1
  await auth.api.signUpEmail({
    body: {
      name: "Rahim Uddin",
      email: "rahim@gmail.com",
      password: "password123",
      role: "CUSTOMER",
    },
  });

  // Customer 2
  await auth.api.signUpEmail({
    body: {
      name: "Karim Hassan",
      email: "karim@gmail.com",
      password: "password123",
      role: "CUSTOMER",
    },
  });
  console.log("Customers created");

  // Provider 1
  await auth.api.signUpEmail({
    body: {
      name: "Salam Bhai",
      email: "salamsbistro@gmail.com",
      password: "password123",
      role: "PROVIDER",
    },
  });

  // Provider 2
  await auth.api.signUpEmail({
    body: {
      name: "Fatema Apa",
      email: "fatemaskitchen@gmail.com",
      password: "password123",
      role: "PROVIDER",
    },
  });
  console.log("Providers created");

  // Get user ids from db
  const provider1User = await prisma.user.findUnique({
    where: { email: "salamsbistro@gmail.com" },
  });

  const provider2User = await prisma.user.findUnique({
    where: { email: "fatemaskitchen@gmail.com" },
  });

  const customer1 = await prisma.user.findUnique({
    where: { email: "rahim@gmail.com" },
  });

  const customer2 = await prisma.user.findUnique({
    where: { email: "karim@gmail.com" },
  });

  if (!provider1User || !provider2User || !customer1 || !customer2) {
    throw new Error("Users not found after creation");
  }

  // Provider Profiles
  const provider1 = await prisma.providerProfile.create({
    data: {
      userId: provider1User.id,
      shopName: "Salam's Bistro",
      description: "Authentic Bangladeshi food with homely taste",
      logo: "https://api.dicebear.com/7.x/shapes/svg?seed=bistro",
      coverImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
      address: "Road 5, Banani",
      city: "Dhaka",
      phone: "01733333333",
      isVerified: true,
      isOpen: true,
    },
  });

  const provider2 = await prisma.providerProfile.create({
    data: {
      userId: provider2User.id,
      shopName: "Fatema's Kitchen",
      description: "Traditional home cooked meals delivered fresh",
      logo: "https://api.dicebear.com/7.x/shapes/svg?seed=kitchen",
      coverImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
      address: "Sector 7, Uttara",
      city: "Dhaka",
      phone: "01744444444",
      isVerified: true,
      isOpen: true,
    },
  });
  console.log("Provider profiles created");

  // Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Bengali",
        slug: "bengali",
        image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400",
      },
    }),
    prisma.category.create({
      data: {
        name: "Burger",
        slug: "burger",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
      },
    }),
    prisma.category.create({
      data: {
        name: "Pizza",
        slug: "pizza",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
      },
    }),
    prisma.category.create({
      data: {
        name: "Biryani",
        slug: "biryani",
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400",
      },
    }),
    prisma.category.create({
      data: {
        name: "Dessert",
        slug: "dessert",
        image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400",
      },
    }),
  ]);
  console.log("Categories created");

  // Meals
  const meals = await Promise.all([
    prisma.meal.create({
      data: {
        title: "Beef Kacchi Biryani",
        description: "Authentic Dhaka style kacchi biryani with tender beef and aromatic basmati rice",
        price: 280,
        images: ["https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600"],
        tags: ["biryani", "beef", "popular"],
        prepTime: 45,
        categoryId: categories[3].id,
        providerId: provider1.id,
      },
    }),
    prisma.meal.create({
      data: {
        title: "Chicken Roast",
        description: "Juicy whole chicken roast with special spice blend and gravy",
        price: 320,
        images: ["https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=600"],
        tags: ["chicken", "roast", "special"],
        prepTime: 40,
        categoryId: categories[0].id,
        providerId: provider1.id,
      },
    }),
    prisma.meal.create({
      data: {
        title: "Mutton Rezala",
        description: "Classic Mughal style mutton rezala with white gravy and whole spices",
        price: 380,
        images: ["https://images.unsplash.com/photo-1545247181-516773cae754?w=600"],
        tags: ["mutton", "bengali", "special"],
        prepTime: 50,
        categoryId: categories[0].id,
        providerId: provider1.id,
      },
    }),
    prisma.meal.create({
      data: {
        title: "Chicken Burger",
        description: "Crispy fried chicken burger with fresh lettuce, tomato and special sauce",
        price: 180,
        images: ["https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600"],
        tags: ["burger", "chicken", "fast food"],
        prepTime: 20,
        categoryId: categories[1].id,
        providerId: provider2.id,
      },
    }),
    prisma.meal.create({
      data: {
        title: "Margherita Pizza",
        description: "Classic thin crust pizza with fresh mozzarella and basil",
        price: 350,
        images: ["https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600"],
        tags: ["pizza", "vegetarian", "italian"],
        prepTime: 30,
        categoryId: categories[2].id,
        providerId: provider2.id,
      },
    }),
    prisma.meal.create({
      data: {
        title: "Firni",
        description: "Traditional Bengali rice pudding with cardamom and rose water",
        price: 80,
        images: ["https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600"],
        tags: ["dessert", "sweet", "bengali"],
        prepTime: 15,
        categoryId: categories[4].id,
        providerId: provider2.id,
      },
    }),
  ]);
  console.log("Meals created");

  // Orders
  await prisma.order.create({
    data: {
      customerId: customer1.id,
      providerId: provider1User.id,
      status: "DELIVERED",
      totalAmount: 560,
      deliveryAddress: "123 Mirpur Road",
      deliveryCity: "Dhaka",
      items: {
        create: [{ mealId: meals[0].id, quantity: 2, price: 280 }],
      },
    },
  });

  await prisma.order.create({
    data: {
      customerId: customer2.id,
      providerId: provider2User.id,
      status: "PREPARING",
      totalAmount: 530,
      deliveryAddress: "45 Dhanmondi",
      deliveryCity: "Dhaka",
      items: {
        create: [
          { mealId: meals[3].id, quantity: 1, price: 180 },
          { mealId: meals[4].id, quantity: 1, price: 350 },
        ],
      },
    },
  });
  console.log("Orders created");

  // Reviews
  await prisma.review.create({
    data: {
      customerId: customer1.id,
      mealId: meals[0].id,
      rating: 5,
      comment: "Absolutely delicious! Best kacchi biryani in Dhaka. Will order again!",
      sentiment: "positive",
    },
  });

  await prisma.review.create({
    data: {
      customerId: customer2.id,
      mealId: meals[3].id,
      rating: 4,
      comment: "Really good burger. Crispy and fresh. Delivery was a bit slow though.",
      sentiment: "positive",
    },
  });
  console.log("Reviews created");

  console.log("\nSeeding completed successfully!");
  console.log("\nDemo Credentials:");
  console.log("---------------------------------");
  console.log("Admin    -> admin@meowmeal.com / password123");
  console.log("Customer -> rahim@gmail.com / password123");
  console.log("Provider -> salamsbistro@gmail.com / password123");
  console.log("---------------------------------");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });