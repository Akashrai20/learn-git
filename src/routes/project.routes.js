import { Router } from "express";
import {
    getProject,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    addMembersToProject,
    getProjectMembers,
    updateMemberRole,
    deleteMember,
} from "../controllers/project.controllers.js";

import { validate } from "../middlewares/validator.middleware.js";
import {
    createProjectValidator,
    addMembertoProjectValidator,
} from "../validators/index.js";
import {
    verifyJWT,
    validateProjectPermission,
} from "../middlewares/auth.middleware.js";
import { AvailableUserRole, UserRoleEnum } from "../utils/constants.js";
import { ProjectMember } from "../models/projectmember.model.js";
const router = Router();
router.use(verifyJWT);

router
    .route("/")
    .get(getProject)
    .post(createProjectValidator(), validate, createProject);

router
    .route("/:projectId")
    .get(validateProjectPermission(AvailableUserRole), getProjectById)
    .put(
        validateProjectPermission([UserRoleEnum.ADMIN]),
        createProjectValidator(),
        validate,
        updateProject,
    )
    .delete(validateProjectPermission([UserRoleEnum.ADMIN]), deleteProject);

router
    .route("/:projectId/members")
    .get(getProjectMembers)
    .post(
        validateProjectPermission([UserRoleEnum.ADMIN]),
        addMembertoProjectValidator(),
        validate,
        addMembersToProject,
    );

router
    .route("/:projectId/members/:userId")
    .put(validateProjectPermission([UserRoleEnum.ADMIN]), updateMemberRole)
    .delete(validateProjectPermission([UserRoleEnum.ADMIN]), deleteMember);

export default router;
