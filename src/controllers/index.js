const { getDataDB, getAgeInterval, getSumInterval, getIntervalObj, getEpoch, age, sumInterval, epoch } = require('../services/index')
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

        const { registered, unregistered } = await mapValues(data)

        const sumRegistered = await sumIntervals(registered)
        const registeredEpoch = await epoch(sumRegistered)
        let availability = await calcula(Math.round(parseFloat(registeredEpoch.rows[0]["seconds"])) / 60)

        const sumUnregistered = await sumIntervals(unregistered)
        const unregisteredEpoch = await epoch(sumUnregistered)
        let unavailability = await calcula(Math.round(parseFloat(unregisteredEpoch.rows[0]["seconds"])) / 60)

        let rangeDate = await getAgeInterval(`${startDate} 00:00:00`, `${endDate} 23:59:59`)
        rangeDate = await getIntervalObj(rangeDate[0].interval)
        rangeDate = getAllKeys(rangeDate[0].interval)

        const percent = await calcPercent(rangeDate, registeredEpoch.rows, unregisteredEpoch.rows)

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

    const rangeDateEpoch = await getEpoch(rangeDateText)
    const availabilityEpoch = availability
    const unavailabilityEpoch = unavailability

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

async function mapValues(data) {
    let registered = ['0 days 00:00:00']
    let unregistered = ['0 days 00:00:00']

    if (data.length == 1) {
        const { rowCount, rows } = await age(dateWithHours(data[0].data_hora), `${dateWithHours(new Date())}`)

        if (rowCount == 1) {
            if (data[0].status == 'REG')
                registered.push(rows[0]["interval"])

            else if (data[0].status == 'NRE')
                unregistered.push(rows[0]["interval"])
        }

        return {
            registered,
            unregistered
        }
    }

    for (let i = 0, j = 1; i < data.length; i++, j++) {
        if (data[j]) {
            const { rowCount, rows } = await age(dateWithHours(data[i].data_hora), dateWithHours(data[j].data_hora))

            if (rowCount == 1) {
                if ((data[i].status == 'REG' && data[j].status == 'NRE') || (data[i].status == 'REG' && data[j].status == 'REG')) // ficou disponível por X tempo
                    registered.push(rows[0]["interval"])

                else if ((data[i].status == 'NRE' && data[j].status == 'REG') || (data[i].status == 'NRE' && data[j].status == 'NRE')) // ficou indisponível por X tempo
                    unregistered.push(rows[0]["interval"])

            }
        } else {
            const { rowCount, rows } = await age(dateWithHours(data[data.length - 1].data_hora), `${dateWithHours(new Date())}`)

            if (rowCount == 1) {
                if (data[data.length - 1].status == 'REG')
                    registered.push(rows[0]["interval"])

                else if (data[data.length - 1].status == 'NRE')
                    unregistered.push(rows[0]["interval"])
            }
        }
    }

    return {
        registered,
        unregistered
    }
}

async function sumIntervals(array) {
    let localSum = '0 days 00:00:00'

    if (array.length > 0) {
        const { rowCount, rows } = await sumInterval(localSum, array[0])

        localSum = rows[0]["interval"]

        if (rowCount == 1) {
            for (let i = 1; i < array.length; i++) {
                const { rowCount, rows } = await sumInterval(localSum, array[i])

                if (rowCount == 1)
                    localSum = rows[0]["interval"]
                else
                    localSum = '0 days 00:00:00'
            }
        }
    }

    return localSum
}

async function calcula(valorInicio) {
    //primeiro criei constantes para armazenar os valores dos tempos em MINUTOS.
    const horas = 60; //minuto * 60
    const dias = 1440; //hora * 24
    const semanas = 10080; //dias * 7
    const meses = 302400; //semanas * 4
    const anos = 3628800; //meses * 12

    // Variaveis para manipulação
    let ano = 0
    let mes = 0
    let semana = 0
    let dia = 0
    let hora = 0
    let minuto = 0

    if (valorInicio > anos) { //verifica se é maior que um ano
        ano = Math.floor(valorInicio / anos); //cria a variável ano e armazena a quantidade de anos nela
        valorInicio = valorInicio - (anos * ano); //atualiza o valorInicio
    } else {
        ano = 0; //se for menor que um ano, cria a variável ano e deixa zerada
    }

    //faz o mesmo para os meses
    if (valorInicio > meses) {
        mes = Math.floor(valorInicio / meses);
        valorInicio = valorInicio - (meses * mes);
    } else {
        mes = 0;
    }

    //faz o mesmo para as semanas
    if (valorInicio > semanas) {
        semana = Math.floor(valorInicio / semanas);
        valorInicio = valorInicio - (semanas * semana);
    } else {
        semana = 0;
    }

    //faz o mesmo para os dias
    if (valorInicio > dias) {
        dia = Math.floor(valorInicio / dias);
        valorInicio = valorInicio - (dias * dia);
    } else {
        dia = 0;
    }

    //faz o mesmo para os horas
    if (valorInicio > horas) {
        hora = Math.floor(valorInicio / horas);
        valorInicio = valorInicio - (horas * hora);
    } else {
        hora = 0;
    }

    minuto = Math.floor(valorInicio); //o que sobra são minutos

    return {
        years: ano,
        months: mes,
        weeks: semana,
        days: dia,
        hours: hora,
        minutes: minuto
    }
}

module.exports = {
    relatorio,
    serverOn
}