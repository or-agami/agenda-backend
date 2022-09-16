const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')

async function query(filterBy = {}) {
    try {
        const criteria = _buildCriteria(filterBy)
        // const criteria = {}
        const collection = await dbService.getCollection('task')
        // var tasks = await collection.find(criteria).toArray()
        // var tasks = await collection.find({}).toArray()
        // console.log('collection:', collection)
        var tasks = await collection.aggregate([
            {
                $match: criteria
            },
            {
                $lookup:
                {
                    localField: 'userId',
                    from: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $lookup:
                {
                    localField: 'boardId',
                    from: 'board',
                    foreignField: '_id',
                    as: 'board'
                }
            },
            {
                $unwind: '$board'
            }
        ]).toArray()
        tasks = tasks.map(task => {
            task.user = { _id: task.user._id, fullname: task.user.fullname }
            task.board = { _id: task.board._id, name: task.board.name, price: task.board.price }
            delete task.userId
            delete task.boardId
            return task
        })
        return tasks
    } catch (err) {
        logger.error('cannot find tasks', err)
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

function _buildCriteria(filterBy) {
    const criteria = {}
    console.log('filterBy from taskService:', filterBy)
    if (!filterBy) return criteria
    if (filterBy.byBoardId) criteria.boardId = ObjectId(filterBy.byBoardId)
    if (filterBy.byUserId) criteria.userId = ObjectId(filterBy.byUserId)
    if (filterBy.byTaskId) criteria._id = ObjectId(filterBy.byTaskId)
    console.log('criteria:', criteria)
    return criteria
}

module.exports = {
    query,
    remove,
    add
}


