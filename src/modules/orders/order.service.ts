import { prisma } from "../../config/database";
import { AppError } from "../../errors/AppErrors";
import {
  CreateOrderInput,
  UpdateOrderStatusInput,
  OrderQueryInput,
} from "./order.validation";
import {
  sendNotification,
  sendProviderNotification,
} from "../../config/socket";

export class OrderService {
  // create order (customer)
  async createOrder(customerId: string, data: CreateOrderInput) {
    // meals validate করো এবং price নাও
    const mealIds = data.items.map((item) => item.mealId);

    const meals = await prisma.meal.findMany({
      where: {
        id: { in: mealIds },
        isAvailable: true,
        providerId: data.providerId,
      },
    });

    if (meals.length !== data.items.length) {
      throw new AppError(
        "Some meals are unavailable or do not belong to this provider",
        400
      );
    }

    // total amount calculate করো
    let totalAmount = 0;
    const orderItems = data.items.map((item) => {
      const meal = meals.find((m) => m.id === item.mealId)!;
      const itemTotal = meal.price * item.quantity;
      totalAmount += itemTotal;

      return {
        mealId: item.mealId,
        quantity: item.quantity,
        price: meal.price,
      };
    });

    const order = await prisma.order.create({
      data: {
        customerId,
        providerId: data.providerId,
        deliveryAddress: data.deliveryAddress,
        deliveryCity: data.deliveryCity,
        note: data.note,
        totalAmount,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            meal: {
              select: { id: true, title: true, images: true, price: true },
            },
          },
        },
      },
    });

    // cart clear করো
    const cart = await prisma.cart.findUnique({ where: { customerId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    // provider কে নতুন order এর notification দাও
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { id: data.providerId },
      select: { id: true, userId: true },
    });

    if (providerProfile) {
      sendProviderNotification(providerProfile.id, {
        type: "NEW_ORDER",
        title: "New Order Received",
        message: `You have received a new order of ${orderItems.length} item(s)`,
        data: { orderId: order.id },
      });
    }

    return order;
  }

  // get customer orders
  async getCustomerOrders(customerId: string, query: OrderQueryInput) {
    const page = parseInt(query.page);
    const limit = parseInt(query.limit);
    const skip = (page - 1) * limit;

    const where: any = { customerId };
    if (query.status) where.status = query.status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              meal: {
                select: { id: true, title: true, images: true },
              },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total, page, limit };
  }

  // get order by id
  async getOrderById(id: string, userId: string, userRole: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            meal: {
              select: {
                id: true,
                title: true,
                images: true,
                price: true,
              },
            },
          },
        },
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    // permission check
    if (userRole === "CUSTOMER" && order.customerId !== userId) {
      throw new AppError("You do not have permission to view this order", 403);
    }

    return order;
  }

  // get provider orders
  async getProviderOrders(providerId: string, query: OrderQueryInput) {
    const page = parseInt(query.page);
    const limit = parseInt(query.limit);
    const skip = (page - 1) * limit;

    const where: any = { providerId };
    if (query.status) where.status = query.status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              meal: {
                select: { id: true, title: true, images: true },
              },
            },
          },
          customer: {
            select: { id: true, name: true, phone: true },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total, page, limit };
  }

  // update order status (provider)
  async updateOrderStatus(
    id: string,
    providerId: string,
    data: UpdateOrderStatusInput
  ) {
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.providerId !== providerId) {
      throw new AppError("You do not have permission to update this order", 403);
    }

    // status flow validate করো
    const validTransitions: Record<string, string[]> = {
      PLACED: ["PREPARING", "CANCELLED"],
      PREPARING: ["READY"],
      READY: ["DELIVERED"],
      DELIVERED: [],
      CANCELLED: [],
    };

    if (!validTransitions[order.status].includes(data.status)) {
      throw new AppError(
        `Cannot change status from ${order.status} to ${data.status}`,
        400
      );
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: data.status },
      include: {
        items: {
          include: {
            meal: { select: { id: true, title: true } },
          },
        },
      },
    });

    // customer কে status update notification দাও
    const statusMessages: Record<string, string> = {
      PREPARING: "Your order is being prepared",
      READY: "Your order is ready for delivery",
      DELIVERED: "Your order has been delivered",
      CANCELLED: "Your order has been cancelled",
    };

    sendNotification(updated.customerId, {
      type: "ORDER_STATUS_UPDATE",
      title: "Order Update",
      message: statusMessages[data.status] || "Your order status has been updated",
      data: { orderId: id, status: data.status },
    });

    return updated;
  }

  // cancel order (customer)
  async cancelOrder(id: string, customerId: string) {
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.customerId !== customerId) {
      throw new AppError("You do not have permission to cancel this order", 403);
    }

    if (order.status !== "PLACED") {
      throw new AppError("Only PLACED orders can be cancelled", 400);
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return updated;
  }

  // get all orders (admin)
  async getAllOrders(query: OrderQueryInput) {
    const page = parseInt(query.page);
    const limit = parseInt(query.limit);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              meal: { select: { id: true, title: true } },
            },
          },
          customer: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total, page, limit };
  }
}