import { Router, type IRouter } from "express";
import { count, eq, sql } from "drizzle-orm";
import { GetMerchantOverviewResponse } from "@workspace/api-zod";
import { db, mealsTable, ordersTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/merchant/overview", async (_req, res) => {
  const [mealCounts] = await db
    .select({
      mealCount: count(mealsTable.id),
      availableMealCount: sql<number>`count(*) filter (where ${mealsTable.available} = true)`,
    })
    .from(mealsTable);
  const [orderCounts] = await db
    .select({
      pendingOrderCount: sql<number>`count(*) filter (where ${ordersTable.status} = 'pending')`,
      acceptedOrderCount: sql<number>`count(*) filter (where ${ordersTable.status} = 'accepted')`,
      totalRevenue: sql<number>`coalesce(sum(${ordersTable.total}) filter (where ${ordersTable.status} = 'accepted'), 0)`,
    })
    .from(ordersTable);
  res.json(GetMerchantOverviewResponse.parse({
    mealCount: Number(mealCounts?.mealCount ?? 0),
    availableMealCount: Number(mealCounts?.availableMealCount ?? 0),
    pendingOrderCount: Number(orderCounts?.pendingOrderCount ?? 0),
    acceptedOrderCount: Number(orderCounts?.acceptedOrderCount ?? 0),
    totalRevenue: Number(orderCounts?.totalRevenue ?? 0),
  }));
});

export default router;