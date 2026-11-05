import { Router } from "express";

import installationRoutes from "./installation/installation.route.js";
import pullRequestRoutes from "./pullRequest/pullRequest.route.js";

const router = Router();

router.use("/installations", installationRoutes);
router.use("/pull-requests", pullRequestRoutes);

export default router;

