const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')

// Get tasks by user or by board
async function query(filterBy) {
    try {
        const aggregation = _buildTasksAggregation(filterBy)
        const collection = await dbService.getCollection('board')
        const tasks = await collection.aggregate(aggregation).toArray()
        return tasks
    } catch (err) {
        logger.error('cannot find tasks', err)
        throw err
    }
}

async function getById(taskId) {
    try {
        const aggregation = _buildTaskIdAggregation(taskId)
        const collection = await dbService.getCollection('board')
        const [task] = await collection.aggregate(aggregation).toArray()
        // console.log('task from taskService:', task)
        return task
    } catch (err) {
        logger.error('cannot find task', err)
        throw err
    }
}

module.exports = {
    query,
    getById,
}

function _buildTasksAggregation(filterBy) {

    const aggregation = [
        { '$project': { '_id': 0, 'groups': 1 } },
        { '$unwind': { 'path': '$groups' } },
        { '$project': { 'tasks': '$groups.tasks' } },
        { '$unwind': { 'path': '$tasks' } }
    ]

    if (filterBy?.boardId) aggregation.unshift({
        '$match': { '_id': { '$eq': ObjectId(filterBy.boardId) } }
    })

    if (filterBy?.userId) aggregation.push({
        '$match': { 'tasks.memberIds': { '$in': [filterBy.userId, 'tasks.memberIds'] } }
    })

    aggregation.push({
        '$replaceRoot': { 'newRoot': '$tasks' }
    })

    return aggregation
}

function _buildTaskIdAggregation(taskId) {
    const aggregation = [
        { '$project': { '_id': 0, 'groups': 1 } },
        { '$unwind': { 'path': '$groups' } },
        { '$project': { 'tasks': '$groups.tasks' } },
        { '$unwind': { 'path': '$tasks' } },
        { '$match': { 'tasks.id': { '$eq': taskId } } },
        { '$replaceRoot': { 'newRoot': '$tasks' } }
    ]
    return aggregation
}