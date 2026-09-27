import { Router, type IRouter } from "express";
import healthRouter from "./health";
import mealsRouter from "./meals";
import ordersRouter from "./orders";
import merchantRouter from "./merchant";

const router: IRouter = Router();

router.use(healthRouter);
router.use(mealsRouter);
router.use(ordersRouter);
router.use(merchantRouter);

export default router;
