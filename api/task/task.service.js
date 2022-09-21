const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')

async function query(filterBy) {
    try {
        const aggregation = _buildTasksAggregation(filterBy)
        const collection = await dbService.getCollection('board')
        const tasks = await collection.aggregate(aggregation).toArray()
        // console.log('tasks from taskService:', tasks)
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

async function remove(taskId) {
    try {
        const store = asyncLocalStorage.getStore()
        const { loggedinUser } = store
        const collection = await dbService.getCollection('task')
        // remove only if user is owner/admin
        const criteria = { _id: ObjectId(taskId) }
        if (!loggedinUser?.isAdmin) criteria.userId = ObjectId(loggedinUser._id)
        const { deletedCount } = await collection.deleteOne(criteria)
        return deletedCount
    } catch (err) {
        logger.error(`cannot remove task ${taskId}`, err)
        throw err
    }
}

module.exports = {
    query,
    getById,
    remove,
}

function _buildTasksAggregation(filterBy) {
    let aggregation = []
    // console.log('filterBy from taskService:', filterBy)

    if (filterBy?.boardId) aggregation.push(
        { '$match': { '_id': { '$eq': ObjectId(filterBy.boardId) } } }
    )
    aggregation.push(
        { '$project': { '_id': 0, 'groups': 1 } },
        { '$unwind': { 'path': '$groups' } },
        { '$project': { 'tasks': '$groups.tasks' } },
        { '$unwind': { 'path': '$tasks' } }
    )
    if (filterBy?.userId) aggregation.push(
        { '$match': { 'tasks.memberIds': { '$in': [filterBy.userId, 'tasks.memberIds'] } } }
    )
    aggregation.push(
        { '$replaceRoot': { 'newRoot': '$tasks' } }
    )

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

// function _buildTaskIdAggregation(taskId) {
//     return [
//         { '$match': { 'groups.tasks.id': { '$eq': taskId } } },
//         {
//             '$project': {
//                 '_id': 0,
//                 'tasks': {
//                     '$filter': {
//                         'input': '$groups.tasks',
//                         'as': 'tasks',
//                         'cond': {
//                             '$in': [`${taskId}`, '$$tasks.id']
//                         },
//                         'limit': 1
//                     }
//                 }
//             }
//         },
//         { '$unwind': { 'path': '$tasks' } },
//         {
//             '$project': {
//                 'task': {
//                     '$filter': {
//                         'input': '$tasks',
//                         'as': 'task',
//                         'cond': {
//                             '$eq': [`${taskId}`, '$$task.id']
//                         },
//                         'limit': 1
//                     }
//                 }
//             }
//         },
//         { '$unwind': { 'path': '$task' } }
//     ]
// }