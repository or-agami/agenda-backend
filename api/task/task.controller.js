const logger = require('../../services/logger.service')
const authService = require('../auth/auth.service')
const userService = require('../user/user.service')
const boardService = require('../board/board.service')
const socketService = require('../../services/socket.service')
const taskService = require('./task.service')

async function getTasks(req, res) {
    try {
        // const filterBy = (req.query) ? JSON.parse(req.query) : null
        const filterBy = (req.query) ? req.query : null
        const tasks = await taskService.query(filterBy)
        res.send(tasks)
    } catch (err) {
        logger.error('Cannot get tasks', err)
        res.status(500).send({ err: 'Failed to get tasks' })
    }
}

async function deleteTask(req, res) {
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


async function addTask(req, res) {

    var loggedinUser = authService.validateToken(req.cookies.loginToken)

    try {
        var task = req.body
        task.byUserId = loggedinUser._id
        task = await taskService.add(task)
        task.board = await boardService.getById(task.boardId)
        task.user = await userService.getById(task.userId)

        delete task.userId
        delete task.boardId

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

module.exports = {
    getTasks,
    deleteTask,
    addTask
}