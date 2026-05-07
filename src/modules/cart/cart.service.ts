import { prisma } from "../../config/database";
import { AppError } from "../../errors/AppErrors";
import { AddToCartInput, UpdateCartItemInput } from "./cart.validation";

export class CartService {
  // get or create cart
  private async getOrCreateCart(customerId: string) {
    let cart = await prisma.cart.findUnique({
      where: { customerId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { customerId },
      });
    }

    return cart;
  }

  // get cart with items
  async getCart(customerId: string) {
    const cart = await prisma.cart.findUnique({
      where: { customerId },
      include: {
        items: {
          include: {
            meal: {
              select: {
                id: true,
                title: true,
                price: true,
                images: true,
                isAvailable: true,
                provider: {
                  select: {
                    id: true,
                    shopName: true,
                    isOpen: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return { items: [], totalAmount: 0, totalItems: 0 };
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.meal.price * item.quantity,
      0
    );

    const totalItems = cart.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    return { ...cart, totalAmount, totalItems };
  }

  // add item to cart
  async addToCart(customerId: string, data: AddToCartInput) {
    const meal = await prisma.meal.findUnique({
      where: { id: data.mealId },
    });

    if (!meal) {
      throw new AppError("Meal not found", 404);
    }

    if (!meal.isAvailable) {
      throw new AppError("This meal is currently unavailable", 400);
    }

    const cart = await this.getOrCreateCart(customerId);

    // item already in cart কিনা check করো
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, mealId: data.mealId },
    });

    if (existingItem) {
      // quantity update করো
      const updated = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + data.quantity },
        include: {
          meal: {
            select: { id: true, title: true, price: true, images: true },
          },
        },
      });

      return updated;
    }

    // নতুন item add করো
    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        mealId: data.mealId,
        quantity: data.quantity,
      },
      include: {
        meal: {
          select: { id: true, title: true, price: true, images: true },
        },
      },
    });

    return cartItem;
  }

  // update cart item quantity
  async updateCartItem(
    customerId: string,
    itemId: string,
    data: UpdateCartItemInput
  ) {
    const cart = await prisma.cart.findUnique({ where: { customerId } });

    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!cartItem) {
      throw new AppError("Cart item not found", 404);
    }

    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: data.quantity },
      include: {
        meal: {
          select: { id: true, title: true, price: true, images: true },
        },
      },
    });

    return updated;
  }

  // remove item from cart
  async removeFromCart(customerId: string, itemId: string) {
    const cart = await prisma.cart.findUnique({ where: { customerId } });

    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!cartItem) {
      throw new AppError("Cart item not found", 404);
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    return { message: "Item removed from cart" };
  }

  // clear cart
  async clearCart(customerId: string) {
    const cart = await prisma.cart.findUnique({ where: { customerId } });

    if (!cart) {
      return { message: "Cart is already empty" };
    }

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return { message: "Cart cleared successfully" };
  }
}