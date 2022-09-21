const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const { addTask, getTasks, removeTask, getTask, updateTask } = require('./task.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log, getTasks)
router.get('/:taskId', log, getTask)

module.exports = router