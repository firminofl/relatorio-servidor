$(document).ready(function() {
    const now = new Date();
    let month = (now.getMonth() + 1);
    let day = now.getDate();

    if (month < 10)
        month = "0" + month;

    if (day < 10)
        day = "0" + day;

    const today = now.getFullYear() + '-' + month + '-' + day;

    $('#startDate').val(today);
    $('#endDate').val(today)
});

async function serverOn() {
    axios.get(`http://${window.location.hostname}:3003/server`)
        .then(({ data }) => {

            document.getElementById('containerConnectedServer').removeAttribute('hidden')

            document.getElementById('connectedServer').innerHTML = data.server

            sessionStorage.setItem('connectedServer', data.server)
        })
        .catch(error => {
            alert(error.response.data.message)
        })
}

async function getReport() {
    const startDate = $('#startDate').val();
    const endDate = $('#endDate').val();

    if (startDate.length == 0 && endDate.length == 0)
        return alert('Data inicial e final estão vazias!')

    if (startDate.length == 0 && endDate.length != 0)
        return alert('Data inicial está vazia!')

    if (startDate.length != 0 && endDate.length == 0)
        return alert('Data final está vazia!')

    if (new Date(startDate).valueOf() > new Date(endDate).valueOf())
        return alert('Data de início não pode ser maior que de fim!')

    const body = {
        startDate,
        endDate
    }

    axios.post(`http://${window.location.hostname}:3003/relatorio`, body)
        .then(({ data }) => {

            if (data) {
                document.getElementById('containerAvailable').removeAttribute('hidden')
                document.getElementById('containerUnavailable').removeAttribute('hidden')
                document.getElementById('btnExportCsv').removeAttribute('hidden')

                addAvailable(data.report.availability, '#tableAvailable tbody', data.percent.availability + '%')
                addAvailable(data.report.unavailability, '#tableUnavailable tbody', data.percent.unavailability + '%')

            } else
                alert('Não há dados no período informado!')

        })
        .catch(error => {
            alert(error.response.data.message)
        })
}

function downloadCsv() {
    const separator = ','
    const tables = ['tableAvailable', 'tableUnavailable']
    const titleCsv = ['Disponibilidade da ura:', 'Indisponibilidade da ura:']

    let csv = [];

    csv.push('Servidor ligado há:');
    csv.push(sessionStorage.getItem('connectedServer'))
    csv.push('\n')

    for (let index = 0; index < tables.length; index++) {
        table_id = tables[index]
        let rows = document.querySelectorAll(`table#${table_id} tr`);

        csv.push(titleCsv[index]);

        for (let i = 0; i < rows.length; i++) {
            let row = []
            let cols = rows[i].querySelectorAll('td, th');

            for (let j = 0; j < cols.length; j++) {
                // Clean innertext to remove multiple spaces and jumpline (break csv)
                let data = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, '').replace(/(\s\s)/gm, ' ')

                data = data.replace(/"/g, '""');
                row.push('"' + data + '"');
            }
            csv.push(row.join(separator));
        }

        csv.push('\n');
    }

    var csv_string = csv.join('\n');

    // Download it
    var filename = 'relatorio_' + new Date().toLocaleDateString() + '.csv';
    var link = document.createElement('a');
    link.style.display = 'none';
    link.setAttribute('target', '_blank');
    link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv_string));
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function addAvailable(data, element, percent) {
    const table = document.querySelector(element)

    // const { years, months, days, hours, minutes, seconds } = getAllKeys(data)

    while (table.hasChildNodes())
        table.removeChild(table.firstChild);

    for (var i = 0; i < 1; i++) {
        let newRow = table.insertRow(i);
        let count = 0;

        // Anos
        const anosCell = newRow.insertCell(count);
        const anosValue = document.createTextNode(data.years);
        anosCell.appendChild(anosValue);
        count++;

        // Meses
        const mesesCell = newRow.insertCell(count);
        const mesesValue = document.createTextNode(data.months);
        mesesCell.appendChild(mesesValue);
        count++;

        // Dias
        const diasCell = newRow.insertCell(count);
        const diasValue = document.createTextNode(data.days);
        diasCell.appendChild(diasValue);
        count++;

        // Horas
        const horasCell = newRow.insertCell(count);
        const horasValue = document.createTextNode(data.hours);
        horasCell.appendChild(horasValue);
        count++;

        // Minutos
        const minutosCell = newRow.insertCell(count);
        const minutosValue = document.createTextNode(data.minutes);
        minutosCell.appendChild(minutosValue);
        count++;

        // Segundos
        const segundosCell = newRow.insertCell(count);
        const segundosValue = document.createTextNode(data.seconds);
        segundosCell.appendChild(segundosValue);
        count++;

        // Porcentagem
        const porcentCell = newRow.insertCell(count);
        const porcentValue = document.createTextNode(percent);
        porcentCell.appendChild(porcentValue);
        count++;
    }

}

function getConnectedServer(data) {
    const { years, months, days, hours, minutes, seconds } = getAllKeys(data)

    const text = `${years} ano(s) ${months} mes(es) ${days} dia(s) ${hours} hora(s) ${minutes} minuto(s) ${seconds} segundo(s)`
    return text
}

function getAllKeys(data) {
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

function clean() {
    startDate.value = ''
    endDate.value = ''
}