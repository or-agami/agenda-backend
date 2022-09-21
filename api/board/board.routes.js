const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const { getBoards, getBoard, addBoard, updateBoard, removeBoard } = require('./board.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log, getBoards)
router.get('/:boardId', log, getBoard)
router.post('/', addBoard)
// router.post('/',log, requireAuth, addBoard)
router.put('/:boardId', updateBoard)
// router.put('/:boardId',log, requireAuth, updateBoard)
router.delete('/:boardId', removeBoard)
// router.delete('/:boardId', requireAuth, requireAdmin, removeBoard)

module.exports = router