const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const { getData, getDataById, addData, updateData, removeData } = require('./data.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log, getData)
router.get('/:dataId', log, getDataById)
router.post('/', log, addData)
router.put('/:dataId', log, updateData)
router.delete('/:dataId', log, removeData)
// router.post('/', log, requireAuth, addData)
// router.put('/:dataId', log, requireAuth, updateData)
// router.delete('/:dataId', log, requireAuth, removeData)

module.exports = router