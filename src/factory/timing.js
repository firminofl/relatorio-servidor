const util = require('util');
const exec = util.promisify(require('child_process').exec);

const poweredServerConsole = async() => {
    const command = `uptime -p | awk -F 'up' '{ print $2 }' | xargs`
    const { stdout } = await exec(command);

    return stdout.split('\n')[0]
}

const getConnectedServer = (data) => {
    const text = `${data.years} ano(s) ${data.months} mes(es) ${data.days} dia(s) ${data.hours} hora(s) ${data.minutes} minuto(s) ${data.seconds} segundo(s)`
    return text
}

const getFullInterval = (data) => {
    const text = `${data.years} years ${data.months} months ${data.days} days ${data.hours} hours ${data.minutes} minutes ${data.seconds} seconds`
    return text
}

const calcutePercent = (total, part) => {
    return ((part / total) * 100).toFixed(2)
}

const getAllKeys = (data) => {
    let fullDate = {
        years: 0,
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    }

    Object.entries(data).forEach(result => {

        switch (result[0]) {
            case 'years':
                fullDate.years = result[1]
                break

            case 'months':
                fullDate.months = result[1]
                break

            case 'days':
                fullDate.days = result[1]
                break

            case 'hours':
                fullDate.hours = result[1]
                break

            case 'minutes':
                fullDate.minutes = result[1]
                break

            case 'seconds':
                fullDate.seconds = result[1]
                break
        }
    })

    return fullDate
}

module.exports = {
    poweredServerConsole,
    getConnectedServer,
    getFullInterval,
    getAllKeys,
    calcutePercent
}