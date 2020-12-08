const asteriskStatus = require('./asterisk-status')
const pg = require('../db/index')
const { dateWithHours, dateWithOnlyHours } = require('../factory/date')

let befStatus = ''

async function monitoring_and_storage(registryHour) {
    try {
        let status = await asteriskStatus.status()

        status == 'Registered' ? status = 'REG' : status = 'NRE'

        const query = `INSERT INTO status (status, data_hora) VALUES ('${status}', '${dateWithHours(new Date())}');`

        befStatus = await getBefStatus(befStatus)

        if (status != befStatus || dateWithOnlyHours(new Date()) == registryHour) {
            befStatus = status
            await pg.queryAsync(query)
        }
    } catch (error) {
        console.log(error)
        throw new Error('Erro ao obter dados do asterisk e inserir na base de dados!')
    }
}

async function getBefStatus(befStatus) {
    try {
        if (befStatus == '') {
            const searchBefStatus = `SELECT status FROM status as s WHERE id <= @id ORDER BY id DESC limit 1;`
            const { rowCount, rows } = await pg.queryAsync(searchBefStatus)

            if (rowCount == 1)
                befStatus = rows[0].status
        }
        return befStatus
    } catch (error) {
        return ''
    }
}

module.exports = {
    monitoring_and_storage
}