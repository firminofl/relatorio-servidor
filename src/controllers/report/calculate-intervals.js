const { sumInterval } = require("../../services")

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

module.exports = {
    sumIntervals
}