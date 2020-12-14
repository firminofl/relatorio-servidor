const {
    getDataDB,
    getIntervalObj,
    epoch,
    age
} = require('../services/index')

const {
    poweredServerConsole,
    getConnectedServer,
    getFullInterval,
    getAllKeys,
    calcutePercent,
    getTimes
} = require('../factory/timing')

const { mapValues } = require('./report/separate-values')
const { sumIntervals } = require('./report/calculate-intervals')

async function serverOn(req, res) {
    // Obter o tempo que o servidor ficou ligado
    let server = await connectedServer()
    server = getAllKeys(server)
    server = getConnectedServer(server)

    return res.status(200).send({
        server
    })
}

async function relatorio(req, res) {
    try {
        let { startDate, endDate } = req.body

        if (startDate == '' && endDate == '') {
            return res.status(400).send({
                message: 'Faltou os parâmetros de data!'
            })
        }

        if (startDate == '' && endDate != '')
            return res.status(400).send({
                message: 'Insira um período para o relatório!'
            })

        if (startDate != '' && endDate == '')
            return res.status(400).send({
                message: 'Insira um período para o relatório!'
            })

        if (new Date(startDate).valueOf() > new Date(endDate).valueOf())
            return res.status(400).send({
                message: 'Data de início não pode ser maior que de fim!'
            })

        // Obter os registros de acordo com o filtro
        const data = await getDataDB(startDate, endDate)

        // data início -> data fim (ficou indisponível ou disponível)?
        if (data.length == 0) {
            return res.status(400).send({
                message: 'Não há dados no período informado!'
            })
        }

        const { registered, unregistered } = await mapValues(data)

        const sumRegistered = await sumIntervals(registered)
        const registeredEpoch = await epoch(sumRegistered)
        let availability = getTimes(Math.round(parseFloat(registeredEpoch.rows[0]["seconds"])) / 60)

        const sumUnregistered = await sumIntervals(unregistered)
        const unregisteredEpoch = await epoch(sumUnregistered)
        let unavailability = getTimes(Math.round(parseFloat(unregisteredEpoch.rows[0]["seconds"])) / 60)

        const { rows, rowCount } = await age(`${startDate} 00:00:00`, `${endDate} 23:59:59`)

        if (rowCount == 1) {
            rangeDate = await getIntervalObj(rows[0]["interval"])
            rangeDate = getAllKeys(rangeDate[0]["interval"])
        }
        const percent = await calcPercent(rangeDate, registeredEpoch.rows, unregisteredEpoch.rows)

        const total = {
            dateRange: `${startDate} - ${endDate}`,
            report: {
                availability,
                unavailability
            },
            percent,
            storage: data
        }

        return res.status(200).send(total)
    } catch (error) {
        console.log(error)
        return res.status(400).send({
            message: 'Falhar ao obter o relatório do servidor!'
        })
    }
}

async function calcPercent(rangeDate, availability, unavailability) {
    const rangeDateText = getFullInterval(rangeDate)

    const rangeDateEpoch = await epoch(rangeDateText)
    const availabilityEpoch = availability
    const unavailabilityEpoch = unavailability

    let percent = {
        total: "100",
        availability: "0",
        unavailability: "0"
    }

    if (rangeDateEpoch.rows[0].seconds > 0 && availabilityEpoch[0].seconds >= 0 && unavailabilityEpoch[0].seconds >= 0) {
        const calcAvai = calcutePercent(rangeDateEpoch.rows[0].seconds, rangeDateEpoch.rows[0].seconds - unavailabilityEpoch[0].seconds)
        const calcUnavai = calcutePercent(rangeDateEpoch.rows[0].seconds, unavailabilityEpoch[0].seconds)

        percent.availability = calcAvai
        percent.unavailability = calcUnavai
    }

    return percent
}

async function connectedServer() {
    let power = await poweredServerConsole()
    power = await getIntervalObj(power)

    if (power.length > 0)
        power = power[0].interval
    else
        power = {}

    return power
}

module.exports = {
    relatorio,
    serverOn
}