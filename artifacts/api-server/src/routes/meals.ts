import { Router, type IRouter } from "express";
import { and, eq, asc } from "drizzle-orm";
import {
  CreateMealBody,
  CreateMealResponse,
  DeleteMealParams,
  ListMealsQueryParams,
  ListMealsResponse,
  UpdateMealBody,
  UpdateMealParams,
  UpdateMealResponse,
} from "@workspace/api-zod";
import { db, mealsTable } from "@workspace/db";

const router: IRouter = Router();

function toMealResponse(meal: typeof mealsTable.$inferSelect) {
  return {
    ...meal,
    photoUrl: meal.photoUrl ?? null,
    createdAt: meal.createdAt.toISOString(),
    updatedAt: meal.updatedAt.toISOString(),
  };
}

router.get("/meals", async (req, res) => {
  const { includeUnavailable } = ListMealsQueryParams.parse(req.query);
  const rows = await db
    .select()
    .from(mealsTable)
    .where(includeUnavailable ? undefined : eq(mealsTable.available, true))
    .orderBy(asc(mealsTable.createdAt));
  res.json(ListMealsResponse.parse(rows.map(toMealResponse)));
});

router.post("/meals", async (req, res) => {
  const data = CreateMealBody.parse(req.body);
  const [meal] = await db.insert(mealsTable).values(data).returning();
  res.status(201).json(CreateMealResponse.parse(toMealResponse(meal)));
});

router.patch("/meals/:id", async (req, res) => {
  const { id } = UpdateMealParams.parse(req.params);
  const data = UpdateMealBody.parse(req.body);
  const [meal] = await db
    .update(mealsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(mealsTable.id, id))
    .returning();
  if (!meal) {
    res.status(404).json({ error: "Meal not found" });
    return;
  }
  res.json(UpdateMealResponse.parse(toMealResponse(meal)));
});

router.delete("/meals/:id", async (req, res) => {
  const { id } = DeleteMealParams.parse(req.params);
  const [meal] = await db.delete(mealsTable).where(eq(mealsTable.id, id)).returning({ id: mealsTable.id });
  if (!meal) {
    res.status(404).json({ error: "Meal not found" });
    return;
  }
  res.status(204).send();
});

export default router;