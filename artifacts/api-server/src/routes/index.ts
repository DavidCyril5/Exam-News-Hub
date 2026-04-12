import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import postsRouter from "./posts";
import commentsRouter from "./comments";
import commentsStandaloneRouter from "./comments-standalone";
import usersRouter from "./users";
import adminRouter from "./admin";
import uploadRouter from "./upload";
import pushRouter from "./push";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/categories", categoriesRouter);
router.use("/posts", postsRouter);
router.use("/posts", commentsRouter);
router.use("/comments", commentsStandaloneRouter);
router.use("/users", usersRouter);
router.use("/admin", adminRouter);
router.use("/upload", uploadRouter);
router.use("/push", pushRouter);

export default router;
