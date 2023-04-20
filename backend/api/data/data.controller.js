const dataService = require('./data.service.js')
const socketService = require('../../services/socket.service.js')
const authService = require('../auth/auth.service')

const logger = require('../../services/logger.service.js')

// GET LIST
async function getData(req, res) {

    try {
        logger.debug('Getting Data')
        const data = await dataService.query()
        res.send(data)
    } catch (err) {
        logger.error('Failed to get data', err)
        res.status(500).send({ err: 'Failed to get data' })
    }
}



// READ
async function getDataById(req, res) {
    try {
        const { dataId } = req.params
        const data = await dataService.getById(dataId)
        res.send(data)
    } catch (err) {
        logger.error('Failed to get data', err)
        res.status(500).send({ err: 'Failed to get data' })
    }
}

// CREATE
async function addData(req, res) {

    try {
        const currData = req.body
        console.log('currData', currData)
        const data = await dataService.add(currData)

        res.send(data)
    }
    catch (err) {
        logger.error('Failed to add data', err)
        res.status(500).send({ err: 'Failed to add data' })
    }
}

// UPDATE
async function updateData(req, res) {
    // var loggedInUser = await authService.validateToken(req.cookies.loginToken)
    try {
        const dataToUpdate = req.body
        const updatedData = await dataService.update(dataToUpdate)
        // socketService.broadcast({ type: 'data-updated', data: updatedData, userId: loggedInUser._id })
        res.send(updatedData)
    } catch (err) {
        logger.error('Failed to update data', err)
        res.status(500).send({ err: 'Failed to update data' })
    }
}

// DELETE
async function removeData(req, res) {
    const dataId = req.params.dataId
    try {
        await dataService.remove(dataId)
        res.send({ msg: 'Removed succesfully' })
    }
    catch (err) {
        logger.error('Failed to remove data', err)
        res.status(500).send({ err: 'Failed to remove data' })
    }
}



module.exports = {
    getData,
    getDataById,
    addData,
    updateData,
    removeData,
}