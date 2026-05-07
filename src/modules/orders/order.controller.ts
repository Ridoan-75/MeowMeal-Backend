import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/apiResponse";
import { OrderService } from "./order.service";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  orderQuerySchema,
} from "./order.validation";
import { prisma } from "../../config/database";

const orderService = new OrderService();

export const createOrder = catchAsync(async (req: Request, res: Response) => {
  const validated = createOrderSchema.parse(req.body);
  const order = await orderService.createOrder(req.user!.id, validated);
  sendResponse(res, 201, true, "Order placed successfully", order);
});

export const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const query = orderQuerySchema.parse(req.query);
  const result = await orderService.getCustomerOrders(req.user!.id, query);

  sendResponse(res, 200, true, "Orders fetched successfully", result.orders, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: Math.ceil(result.total / result.limit),
  });
});

export const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const order = await orderService.getOrderById(
    req.params.id as string,
    req.user!.id,
    req.user!.role,
  );
  sendResponse(res, 200, true, "Order fetched successfully", order);
});

export const getProviderOrders = catchAsync(
  async (req: Request, res: Response) => {
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!providerProfile) {
      return sendResponse(res, 404, false, "Provider profile not found");
    }

    const query = orderQuerySchema.parse(req.query);
    const result = await orderService.getProviderOrders(
      providerProfile.id,
      query,
    );

    sendResponse(res, 200, true, "Orders fetched successfully", result.orders, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
    });
  },
);

export const updateOrderStatus = catchAsync(
  async (req: Request, res: Response) => {
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!providerProfile) {
      return sendResponse(res, 404, false, "Provider profile not found");
    }

    const validated = updateOrderStatusSchema.parse(req.body);
    const order = await orderService.updateOrderStatus(
      req.params.id as string,
      providerProfile.id,
      validated,
    );
    sendResponse(res, 200, true, "Order status updated successfully", order);
  },
);

export const cancelOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await orderService.cancelOrder(
    req.params.id as string,
    req.user!.id,
  );
  sendResponse(res, 200, true, "Order cancelled successfully", order);
});

export const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const query = orderQuerySchema.parse(req.query);
  const result = await orderService.getAllOrders(query);

  sendResponse(res, 200, true, "Orders fetched successfully", result.orders, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: Math.ceil(result.total / result.limit),
  });
});
