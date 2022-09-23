const boardService = require('./board.service')
const logger = require('../../services/logger.service')

//?- GET LIST
async function getBoards(req, res) {
    try {
        logger.debug('Getting Boards')
        const filterBy = (req.query) ? req.query : null
        const boards = await boardService.query(filterBy)
        res.json(boards)
    } catch (error) {
        logger.error('Failed to get Boards', error)
        res.status(500).send({ err: 'Failed to get Boards' })
    }
}

//?- GET BY ID
async function getBoard(req, res) {
    try {
        logger.debug('Getting Board')
        const { boardId } = req.params
        const board = await boardService.getById(boardId)
        res.json(board)
    } catch (error) {
        logger.error('Failed to get Board', error)
        res.status(500).send({ err: 'Failed to get Board' })
    }
}

//?- CREATE
async function addBoard(req, res) {
    try {
        logger.debug('Adding board')
        const board = req.body
        const addedBoard = await boardService.add(board)
        res.json(addedBoard)
    } catch (error) {
        logger.error('Failed to add Board', error)
        res.status(500).send({ err: 'Failed to add Board' })
    }
}

//?- UPDATE
async function updateBoard(req, res) {
    try {
        logger.debug('Updating board')
        const board = req.body
        const updatedBoard = await boardService.update(board)
        res.json(updatedBoard)
    } catch (error) {
        logger.error('Failed to update Board', error)
        res.status(500).send({ err: 'Failed to update Board' })
    }
}

//?- DELETE
async function removeBoard(req, res) {
    try {
        logger.debug('Removing board')
        const { boardId } = req.params
        const removedBoard = await boardService.remove(boardId)
        res.json(removedBoard)
    } catch (error) {
        logger.error('Failed to remove Board', error)
        res.status(500).send({ err: 'Failed to remove Board' })
    }
}

module.exports = {
    getBoards,
    getBoard,
    addBoard,
    updateBoard,
    removeBoard
}  