const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

router.get("/", userController.getAll);
router.get("/categories", userController.getCategories);
router.post("/", userController.create);
router.post("/login", userController.login);

module.exports = router;
