import { Router } from "express";

import installationRoutes from "./installation/installation.route.js";

const router = Router();

router.use("/installations", installationRoutes);

export default router;
