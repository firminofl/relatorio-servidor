const { getDataDB, getAgeInterval, getSumInterval, getIntervalObj, getEpoch } = require('../services/index')
const { dateWithHours } = require('../factory/date')
const { poweredServerConsole, getConnectedServer, getFullInterval, getAllKeys, calcutePercent } = require('../factory/timing')

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

        let availability = await calcDispIndisp(data, 'REG', 'NRE')
        availability = getAllKeys(availability)

        let unavailability = await calcDispIndisp(data, 'NRE', 'REG')
        unavailability = getAllKeys(unavailability)

        let rangeDate = await getAgeInterval(`${startDate} 00:00:00`, `${endDate} 23:59:59`)
        rangeDate = await getIntervalObj(rangeDate[0].interval)
        rangeDate = getAllKeys(rangeDate[0].interval)

        const percent = await calcPercent(rangeDate, availability, unavailability)

        const total = {
            dateRange: `${startDate} - ${endDate}`,
            report: {
                availability,
                unavailability
            },
            percent
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
    const availabilityText = getFullInterval(availability)
    const unavailabilityText = getFullInterval(unavailability)

    const rangeDateEpoch = await getEpoch(rangeDateText)
    const availabilityEpoch = await getEpoch(availabilityText)
    const unavailabilityEpoch = await getEpoch(unavailabilityText)

    let percent = {
        total: "100",
        availability: "0",
        unavailability: "0"
    }

    if (rangeDateEpoch[0].seconds > 0 && availabilityEpoch[0].seconds >= 0 && unavailabilityEpoch[0].seconds >= 0) {
        const calcAvai = calcutePercent(rangeDateEpoch[0].seconds, rangeDateEpoch[0].seconds - unavailabilityEpoch[0].seconds)
        const calcUnavai = calcutePercent(rangeDateEpoch[0].seconds, unavailabilityEpoch[0].seconds)

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

async function calcDispIndisp(data, firstCondition, secondCondition) {
    let getAge = []
    let getInterval = ''
    let ageArray = []
    let buildIntervalJson = []

    if (data.length == 1) {
        if (data[0].status == firstCondition) {
            const age = await getAgeInterval(dateWithHours(data[0].data_hora), `${dateWithHours(new Date())}`)

            if (age.length > 0) {
                const buildIntervalJson = await getIntervalObj(age[0].interval)

                return buildIntervalJson[0].interval
            }

        } else {
            const buildIntervalJson = await getIntervalObj('00:00:00')
            return buildIntervalJson[0].interval
        }
    }

    for (let i = 0, j = 1; i < data.length; i++, j++) {
        if (data[j]) {

            if ((data[i].status == firstCondition && data[j].status == secondCondition) || (data[i].status == firstCondition && data[j].status == firstCondition)) { // ficou disponível por X tempo
                // Calcular o interval entre a primeira data de REG e a data de NRE ou REG e REG
                getAge = await getAgeInterval(dateWithHours(data[i].data_hora), dateWithHours(data[j].data_hora))

                // Guardar esta diferença para somar posteriormente
                if (getAge.length > 0)
                    ageArray.push(getAge[0].interval)
                else
                    ageArray.push('00:00:00')
            }

        } else {

            if (data[data.length - 1].status == firstCondition) {
                // Calcular o interval entre REG e a data atual
                getAge = await getAgeInterval(dateWithHours(data[data.length - 1].data_hora), `${dateWithHours(new Date())}`)

                // Guardar esta diferença para somar posteriormente
                if (getAge.length > 0)
                    ageArray.push(getAge[0].interval)
                else
                    ageArray.push('00:00:00')
            } else {
                ageArray.push('00:00:00')
            }
        }
    }

    if (ageArray.length > 0) {
        getInterval = await getSumInterval('0 days', ageArray[0])

        let i = 1

        if (getInterval.length > 0) {

            getInterval = getInterval[0].interval
            while (i < ageArray.length) {
                if (typeof getInterval == 'object')
                    getInterval = await getSumInterval(getInterval[0].interval, ageArray[i])
                else
                    getInterval = await getSumInterval(getInterval, ageArray[i])

                i++
            }
        }

        if (typeof getInterval == 'object')
            buildIntervalJson = await getIntervalObj(getInterval[0].interval)
        else
            buildIntervalJson = await getIntervalObj(getInterval)

        return buildIntervalJson[0].interval
    }
}

module.exports = {
    relatorio,
    serverOn
}