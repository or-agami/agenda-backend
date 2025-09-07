const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const utilService = require('../../services/util.service')
const ObjectId = require('mongodb').ObjectId

async function query(filterBy) {
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('board')
        var boards = await collection.find(criteria).toArray()
        return boards
    } catch (err) {
        logger.error('cannot find boards', err)
        throw err
    }
}

async function getById(boardId) {
    try {
        const collection = await dbService.getCollection('board')
        const board = await collection.findOne({ _id: ObjectId(boardId) })
        return board
    } catch (err) {
        logger.error(`while finding board ${boardId}`, err)
        throw err
    }
}

async function remove(boardId) {
    try {
        const collection = await dbService.getCollection('board')
        await collection.deleteOne({ _id: ObjectId(boardId) })
        return boardId
    } catch (err) {
        logger.error(`cannot remove board ${boardId}`, err)
        throw err
    }
}

async function add(board) {
    try {
        const collection = await dbService.getCollection('board')
        // Respect provided fields; only set defaults when not provided
        if (!board.style) board.style = 'clr' + utilService.getRandomIntInclusive(1, 17)
        if (!board.cmpsOrder || board.cmpsOrder.length === 0) {
            board.cmpsOrder = ["member", "status", "priority", "timeline", "attachments"]
        }
        if (!board.groups || board.groups.length === 0) {
            board.groups = [{ id: utilService.makeId(), title: 'Group 1', tasks: [] }]
        }
        await collection.insertOne(board)
        return board
    } catch (err) {
        logger.error('cannot insert board', err)
        throw err
    }
}

async function update(board) {
    try {
        const boardId = ObjectId(board._id)
        delete board._id
        const collection = await dbService.getCollection('board')
        await collection.updateOne({ _id: boardId }, { $set: { ...board } })
        return { _id: boardId, ...board }
    } catch (err) {
        logger.error(`cannot update board ${board._id}`, err)
        throw err
    }
}

async function addMsg(msg) {
    try {
        var boardId = ObjectId(msg.boardId)
        delete msg.boardId
        const collection = await dbService.getCollection('board')
        await collection.updateOne({ _id: boardId }, { $push: { msgs: msg } })
    } catch (err) {
        logger.error(`cannot add message ${msg}`, err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (!filterBy) return criteria
    // if (filterBy.maxPrice && filterBy.maxPrice !== 0) criteria.price = { $lte: +filterBy.maxPrice }
    // if (filterBy.term) criteria.name = { $regex: filterBy.term, $options: 'i' }
    // if (filterBy.labels && filterBy.labels.length > 0) criteria.labels = { $all: filterBy.labels }
    // if (filterBy.inStock) criteria.inStock = { $eq: filterBy.inStock }
    // if (filterBy.inStock) criteria.inStock = { $eq: (filterBy.inStock === 'true') }
    // if (filterBy.labels)
    return criteria
}

module.exports = {
    remove,
    query,
    getById,
    add,
    update,
    addMsg,
}