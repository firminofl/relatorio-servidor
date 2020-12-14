const { dateWithHours, dateWithOutHours, dateWithOnlyHours } = require("../../factory/date")
const { age } = require("../../services")

async function mapValues(data) {
    let registered = ['0 days 00:00:00']
    let unregistered = ['0 days 00:00:00']

    if (data.length == 1) {
        const { rowCount, rows } = await age(`${dateWithOutHours(data[0].data_hora)} 00:00:00`, `${dateWithOutHours(data[0].data_hora)} 23:59:59`)

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
            if (dateWithOutHours(data[data.length - 1].data_hora) == dateWithOutHours(new Date()))
                var { rowCount, rows } = await age(dateWithHours(data[data.length - 1].data_hora), `${dateWithHours(new Date())}`)
            else
                var { rowCount, rows } = await age(dateWithHours(data[data.length - 1].data_hora), `${dateWithOutHours(data[data.length - 1].data_hora)} 23:59:59`)

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

module.exports = {
    mapValues
}