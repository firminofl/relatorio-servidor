const { zeroLeft } = require('./timing')

const buildInterval = (data) => {
    let interval = ''

    if (data.length > 0) {

        Object.entries(data[0].interval).map(result => {
            const key = result[0]
            let value = result[1]

            switch (key) {
                case 'years' || 'year':
                    interval += `${value} years `
                    break

                case 'months' || 'mons':
                    interval += `${value} months `
                    break

                case 'days' || 'day':
                    interval += `${value} days `
                    break

                case 'hours' || 'hour':
                    value = zeroLeft(value)


                    interval += `${value}:`
                    break

                case 'minutes':
                    value = zeroLeft(value)

                    if (interval.split("days")[1])
                        interval += `${value}:`
                    else
                        interval += `00:${value}:`
                    break

                case 'seconds':
                    value = zeroLeft(value)

                    if (interval.split(':')[0])
                        interval += `${value}`
                    else
                        interval += `00:00:${value}`
                    break

                default:
                    interval += '00'
                    break
            }
        })
    }

    return interval
}

module.exports = {
    buildInterval
}