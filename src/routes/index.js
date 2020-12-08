const router = require('express').Router()

const controller = require('../controllers/index')

router.get('/', (req, res) => {
    res.render('index')
})

router.post('/relatorio', controller.relatorio)

router.get('/server', controller.serverOn)

module.exports = router