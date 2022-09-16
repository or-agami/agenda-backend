const express = require('express')
const {requireAuth, requireAdmin} = require('../../middlewares/requireAuth.middleware')
const {log} = require('../../middlewares/logger.middleware')
const {addTask, getTasks, deleteTask} = require('./task.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log, getTasks)
router.post('/',  log, requireAuth, addTask)
router.delete('/:id',  requireAuth, deleteTask)

module.exports = router