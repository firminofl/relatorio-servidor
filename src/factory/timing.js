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

const getTimes = (value) => {
    //primeiro criei constantes para armazenar os valores dos tempos em MINUTOS.
    const horas = 60; //minuto * 60
    const dias = 1440; //hora * 24
    const semanas = 10080; //dias * 7
    const meses = 302400; //semanas * 4
    const anos = 3628800; //meses * 12

    // Variaveis para manipulação
    let year = 0
    let month = 0
    let week = 0
    let day = 0
    let hour = 0
    let minute = 0

    if (value > anos) { //verifica se é maior que um ano
        year = Math.floor(value / anos); //cria a variável ano e armazena a quantidade de anos nela
        value = value - (anos * year); //atualiza o value
    } else {
        year = 0; //se for menor que um ano, cria a variável ano e deixa zerada
    }

    //faz o mesmo para os meses
    if (value > meses) {
        month = Math.floor(value / meses);
        value = value - (meses * month);
    } else {
        month = 0;
    }

    //faz o mesmo para as semanas
    if (value > semanas) {
        week = Math.floor(value / semanas);
        value = value - (semanas * week);
    } else {
        week = 0;
    }

    //faz o mesmo para os dias
    if (value > dias) {
        day = Math.floor(value / dias);
        value = value - (dias * day);
    } else {
        day = 0;
    }

    //faz o mesmo para os horas
    if (value > horas) {
        hour = Math.floor(value / horas);
        value = value - (horas * hour);
    } else {
        hour = 0;
    }

    minute = Math.floor(value); //o que sobra são minutos

    return {
        years: year,
        months: month,
        weeks: week,
        days: day,
        hours: hour,
        minutes: minute
    }
}

module.exports = {
    poweredServerConsole,
    getConnectedServer,
    getFullInterval,
    getAllKeys,
    calcutePercent,
    getTimes
}