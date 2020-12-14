const express = require('express')
const path = require('path')
const cors = require('cors')
require('dotenv').config()

const app = express()

const TIME = 60000 // intervalo de 1 minutos
const REGISTRYHOUR = '00:00'

const monitoringAsterisk = require('./controllers/monitoring-asterisk')

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}));


app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'public'))
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')

app.use(require('./routes/index'))

setInterval(() => {
    monitoringAsterisk.monitoring_and_storage(REGISTRYHOUR)
}, TIME)

app.listen(process.env.APP_PORT || '3003')