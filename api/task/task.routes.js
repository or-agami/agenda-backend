const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const { addTask, getTasks, deleteTask, getTask, updateTask } = require('./task.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', getTasks)
// router.get('/', log, getTasks)
router.get('/:taskId', getTask)
// router.get('/:taskId', log, getTask)
router.post('/', addTask)
// router.post('/',log, requireAuth, addTask)
router.put('/:taskId', updateTask)
// router.put('/:taskId',log, requireAuth, updateTask)
router.delete('/:taskId', deleteTask)
// router.delete('/:taskId', requireAuth, requireAdmin, deleteTask)

module.exports = router