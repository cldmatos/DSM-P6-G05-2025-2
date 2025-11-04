const express = require("express");
const entryController = require("../controllers/entryController");

const router = express.Router();

router.get("/", entryController.getAll);
router.post("/", entryController.create);

module.exports = router;
