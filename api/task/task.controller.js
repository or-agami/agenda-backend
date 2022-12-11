const logger = require('../../services/logger.service')
const authService = require('../auth/auth.service')
const userService = require('../user/user.service')
const socketService = require('../../services/socket.service')
const taskService = require('./task.service')

//?- GET LIST
async function getTasks(req, res) {
    try {
        const filterBy = (req.query) ? req.query : null
        const tasks = await taskService.query(filterBy)
        res.send(tasks)
    } catch (err) {
        logger.error('Cannot get tasks', err)
        res.status(500).send({ err: 'Failed to get tasks' })
    }
}

//?- GET BY ID
async function getTask(req, res) {
    try {
        logger.debug('Getting Task')
        const { taskId } = req.params
        const task = await taskService.getById(taskId)
        res.json(task)
    } catch (error) {
        logger.error('Failed to get Task', error)
        res.status(500).send({ err: 'Failed to get Task' })
    }
}


//?- CREATE
async function addTask(req, res) {

    var loggedinUser = authService.validateToken(req.cookies.loginToken)

    try {
        var task = req.body
        task.byUserId = loggedinUser._id
        task = await taskService.add(task)
        task.task = await taskService.getById(task.taskId)
        task.user = await userService.getById(task.userId)

        delete task.userId
        delete task.taskId

        // socketService.broadcast({type: 'task-added', data: task, userId: loggedinUser._id})
        // socketService.emitToUser({type: 'task-about-you', data: task, userId: task.aboutUserId})

        // const fullUser = await userService.getById(loggedinUser._id)
        // socketService.emitTo({type: 'user-updated', data: fullUser, label: fullUser._id})

        res.send(task)

    } catch (err) {
        logger.error('Failed to add task', err)
        res.status(500).send({ err: 'Failed to add task' })
    }
}

//?- UPDATE
async function updateTask(req, res) {
    try {
        const task = req.body
        const updatedTask = await taskService.update(task)
        res.json(updatedTask)
    } catch (error) {
        logger.error('Failed to update Task', error)
        res.status(500).send({ err: 'Failed to update Task' })
    }
}

//?- DELETE
async function removeTask(req, res) {
    try {
        const deletedCount = await taskService.remove(req.params.id)
        if (deletedCount === 1) {
            res.send({ msg: 'Deleted successfully' })
        } else {
            res.status(400).send({ err: 'Cannot remove task' })
        }
    } catch (err) {
        logger.error('Failed to delete task', err)
        res.status(500).send({ err: 'Failed to delete task' })
    }
}

module.exports = {
    getTasks,
    getTask,
    addTask,
    updateTask,
    removeTask,
}