import { Router, type IRouter } from "express";
import { and, desc, eq, inArray } from "drizzle-orm";
import {
  CreateOrderBody,
  CreateOrderResponse,
  ListOrdersQueryParams,
  ListOrdersResponse,
  UpdateOrderStatusBody,
  UpdateOrderStatusParams,
  UpdateOrderStatusResponse,
} from "@workspace/api-zod";
import { db, mealsTable, ordersTable } from "@workspace/db";

const router: IRouter = Router();
const SERVICE_FEE = 45;

type OrderLine = {
  mealId: number;
  mealName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

function toOrderResponse(order: typeof ordersTable.$inferSelect) {
  const items = Array.isArray(order.items) ? (order.items as OrderLine[]) : [];
  return {
    ...order,
    items,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

router.get("/orders", async (req, res) => {
  const { status } = ListOrdersQueryParams.parse(req.query);
  const rows = await db
    .select()
    .from(ordersTable)
    .where(status ? eq(ordersTable.status, status) : undefined)
    .orderBy(desc(ordersTable.createdAt));
  res.json(ListOrdersResponse.parse(rows.map(toOrderResponse)));
});

router.post("/orders", async (req, res) => {
  const data = CreateOrderBody.parse(req.body);
  const quantities = new Map<number, number>();
  for (const item of data.items) {
    quantities.set(item.mealId, (quantities.get(item.mealId) ?? 0) + item.quantity);
  }
  const mealIds = Array.from(quantities.keys());
  const meals = await db
    .select()
    .from(mealsTable)
    .where(and(inArray(mealsTable.id, mealIds), eq(mealsTable.available, true)));
  if (meals.length !== mealIds.length) {
    res.status(400).json({ error: "One or more meals are unavailable" });
    return;
  }
  const items: OrderLine[] = meals.map((meal) => {
    const quantity = quantities.get(meal.id) ?? 0;
    return {
      mealId: meal.id,
      mealName: meal.name,
      quantity,
      unitPrice: meal.price,
      lineTotal: meal.price * quantity,
    };
  });
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const [order] = await db
    .insert(ordersTable)
    .values({
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      deliveryAddress: data.deliveryAddress,
      paymentMethod: data.paymentMethod,
      status: "pending",
      items,
      subtotal,
      serviceFee: SERVICE_FEE,
      total: subtotal + SERVICE_FEE,
    })
    .returning();
  res.status(201).json(CreateOrderResponse.parse(toOrderResponse(order)));
});

router.patch("/orders/:id/status", async (req, res) => {
  const { id } = UpdateOrderStatusParams.parse(req.params);
  const { status } = UpdateOrderStatusBody.parse(req.body);
  const [order] = await db
    .update(ordersTable)
    .set({ status, updatedAt: new Date() })
    .where(eq(ordersTable.id, id))
    .returning();
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(UpdateOrderStatusResponse.parse(toOrderResponse(order)));
});

export default router;