const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')

async function query(filterBy) {
    try {
        const aggregation = _buildTasksAggregation(filterBy)
        const collection = await dbService.getCollection('board')
        var tasks = await collection.aggregate(aggregation).toArray()
        // var tasks = await collection.aggregate([{ '$project': { '_id': 0, 'groups': 1 } },
        // { '$unwind': { 'path': '$groups' } },
        // { '$project': { 'tasks': '$groups.tasks' } },
        // { '$unwind': { 'path': '$tasks' } }]).toArray()
        console.log('tasks from taskService (post):', tasks)
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
        const [{ task }] = await collection.aggregate(aggregation).toArray()
        console.log('task:', task)
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


async function add(task) {
    try {
        const taskToAdd = {
            userId: ObjectId(task.byUserId),
            boardId: ObjectId(task.byBoardId),
            content: task.content
        }
        const collection = await dbService.getCollection('task')
        await collection.insertOne(taskToAdd)
        return taskToAdd
    } catch (err) {
        logger.error('cannot insert task', err)
        throw err
    }
}

module.exports = {
    query,
    getById,
    remove,
    add
}

// function _buildCriteria(filterBy) {
//     const criteria = {}
//     console.log('filterBy from taskService:', filterBy)
//     if (!filterBy) return criteria
//     if (filterBy.boardId) criteria.boardId = ObjectId(filterBy.boardId)
//     if (filterBy.userId) criteria.userId = ObjectId(filterBy.userId)
//     if (filterBy.groupId) criteria.id = filterBy.groupId
//     console.log('criteria:', criteria)
//     return criteria
// }

function _buildTasksAggregation(filterBy) {
    // const criteria = {}
    let aggregation = []
    console.log('filterBy from taskService:', filterBy)

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

    aggregation.push({ '$replaceRoot': { 'newRoot': '$tasks' } })
    return aggregation
}

function _buildTaskIdAggregation(taskId) {
    return [
        {
            '$match': {
                'groups.tasks.id': {
                    '$eq': taskId
                }
            }
        }, {
            '$project': {
                '_id': 0,
                'tasks': {
                    '$filter': {
                        'input': '$groups.tasks',
                        'as': 'tasks',
                        'cond': {
                            '$in': [
                                `${taskId}`, '$$tasks.id'
                            ]
                        },
                        'limit': 1
                    }
                }
            }
        }, {
            '$unwind': {
                'path': '$tasks'
            }
        }, {
            '$project': {
                'task': {
                    '$filter': {
                        'input': '$tasks',
                        'as': 'task',
                        'cond': {
                            '$eq': [
                                `${taskId}`, '$$task.id'
                            ]
                        },
                        'limit': 1
                    }
                }
            }
        }, {
            '$unwind': {
                'path': '$task'
            }
        }
    ]
}

// filter:
// { groups: { tasks: { id: "c101"} } }
// { groups: { $in: [tasks: { $in: [ id: "c101" ] } ] } }
// { 'groups.tasks.id': { $eq: "c101" } } 👈

// project:
// { 'groups.tasks': 1, _id: 0 }
// { 'groups.tasks': { $elemMatch: {id: "c101"} }, _id: 0 }
//   groups: {
//     $filter: {
//         input: "$groups",
//         as: "group",
//         cond: { $eq: [ "$$group.tasks.id" , "c101"] }
//       }
//   }
// task: { $filter: {
//     input: '$groups.tasks',
//     as: 'task',
//     cond: {$in: ['c101', '$$task.id'] },
//     limit: 1
//   }
// }