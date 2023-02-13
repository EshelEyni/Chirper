const dbService = require('../../services/db.service.js')
const logger = require('../../services/logger.service.js')
const ObjectId = require('mongodb').ObjectId



async function query() {
    try {
        const collection = await dbService.getCollection('data')
        let datas = await collection.find({}).toArray();
        return datas
    } catch (err) {
        console.log('Cannot get Data: ', err)
        throw err
    }
}

async function getById(dataId) {
    try {
        const collection = await dbService.getCollection('data')
        const data = await collection.findOne({ _id: ObjectId(dataId) })
        data.createdAt = ObjectId(data._id).getTimestamp()
        return data
    }
    catch (err) {
        logger.error(`while finding data ${dataId}`, err)
        throw err
    }
}

async function remove(dataId) {
    try {
        const collection = await dbService.getCollection('data')
        await collection.deleteOne({ _id: ObjectId(dataId) })
        return dataId
    } catch (err) {
        logger.error(`cannot remove data ${dataId}`, err)
        throw err
    }
}

async function add(data) {
    const currData = {
        ...data,
        dataProperty: 'im a working data property',
    }
    try {
        const collection = await dbService.getCollection('data')
        await collection.insertOne(currData)
        return currData
    } catch (err) {
        logger.error('cannot insert data', err)
        throw err
    }
}

async function update(dataToUpdate) {
    try {
        var id = ObjectId(dataToUpdate._id)
        delete dataToUpdate._id
        const collection = await dbService.getCollection('data')
        await collection.updateOne({ _id: id }, { $set: { ...dataToUpdate } })

        return { _id: id, ...dataToUpdate }
    } catch (err) {
        logger.error(`cannot update data ${dataToUpdate._id}`, err)
        throw err
    }
}


module.exports = {
    query,
    getById,
    remove,
    add,
    update
}