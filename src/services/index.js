const pg = require('../db/index')

async function getServerStatus(startDate, endDate) {
    try {
        const query = `SELECT 
        (SELECT COUNT(*) as total_diario FROM status s 
        WHERE s.data_hora::date BETWEEN '${startDate}' 
        AND '${endDate}') as total_horas,

        (SELECT COUNT(*) as registrado FROM status as s 
        WHERE s.status = 'REG' 
        AND s.data_hora::date BETWEEN '${startDate}' 
        AND '${endDate}') as Registrado,

        (SELECT COUNT(*) as n_registrado FROM status as s 
        WHERE s.status <> 'REG' 
        AND s.data_hora::date BETWEEN '${startDate}' 
        AND '${endDate}') as N_Registrado

        FROM status as s 
        WHERE s.data_hora::date BETWEEN '${startDate}' 
        AND '${endDate}' 
        ORDER BY COUNT(*) ASC;`

        const { rows } = await pg.queryAsync(query)
        return rows
    } catch (error) {
        throw new Error('1. Erro ao buscar as informações na base de dados!')
    }
}

async function getPoweredServer(startDate, endDate) {
    try {
        const query = `SELECT 
        (SELECT COUNT(*) as total_diario FROM status s) as total_horas,

        (SELECT COUNT(*) as registrado FROM status as s 
        WHERE s.status = 'REG') as Registrado,

        (SELECT COUNT(*) as n_registrado FROM status as s 
        WHERE s.status <> 'REG') as N_Registrado

        FROM status as s 
        ORDER BY COUNT(*) ASC;`

        const { rows } = await pg.queryAsync(query)
        return rows
    } catch (error) {
        throw new Error('2. Erro ao buscar as informações na base de dados!')
    }
}

async function getDataDB(startDate, endDate) {
    try {
        const query = `SELECT status, data_hora FROM 
        (SELECT status, data_hora FROM status as s 
        WHERE s.data_hora BETWEEN 
        '${startDate} 00:00:00' AND 
        '${endDate} 23:59:59' 
        ORDER BY data_hora ASC) as DATAS;`

        const { rows } = await pg.queryAsync(query)
        return rows

    } catch (error) {
        throw new Error('3. Erro ao buscar as informações na base de dados!')
    }
}

async function getAgeInterval(startInterval, endInterval) {
    try {
        const query = `SELECT AGE('${endInterval}','${startInterval}') :: text as interval;`

        const { rows } = await pg.queryAsync(query)
        return rows

    } catch (error) {
        throw new Error('4. Erro ao buscar as informações na base de dados!')
    }
}

async function getSumInterval(startInterval, endInterval) {
    try {
        const query = `SELECT (INTERVAL'${startInterval}' + INTERVAL'${endInterval}') ::text as interval;`

        const { rows } = await pg.queryAsync(query)
        return rows

    } catch (error) {
        console.log(error)
        throw new Error('5. Erro ao buscar as informações na base de dados!')
    }
}

async function getIntervalObj(date) {
    try {

        const query = `SELECT INTERVAL'${date}' as interval;`

        const { rows } = await pg.queryAsync(query)
        return rows

    } catch (error) {
        console.log(error)
        throw new Error('6. Erro ao buscar as informações na base de dados!')
    }
}

async function getEpoch(text) {
    try {

        const query = `SELECT EXTRACT(epoch FROM INTERVAL'${text}') AS seconds;`

        const { rows } = await pg.queryAsync(query)
        return rows

    } catch (error) {
        console.log(error)
        throw new Error('7. Erro ao buscar as informações na base de dados!')
    }
}

module.exports = {
    getServerStatus,
    getPoweredServer,
    getDataDB,
    getAgeInterval,
    getSumInterval,
    getIntervalObj,
    getEpoch
}

/*
do $$
declare
dating timestamp;
dating2 timestamp;
begin
for r in 1..30 loop
    dating := '2020-11-' || r || ' 00:00:00.00000';
    dating2 := '2020-11-' || r || ' 23:59:59.00000';
    INSERT INTO status(status, data_hora) VALUES ('REG', dating);
    INSERT INTO status(status, data_hora) VALUES ('Auth.', dating2);
end loop;
end;
$$;
*/

/*
const query = `SELECT s.data_hora::date,
    (SELECT COUNT(*) as total_diario FROM status s
    WHERE s.data_hora::date BETWEEN '${startDate}'
    AND '${endDate}') as total_horas,

    (SELECT COUNT(*) as registrado FROM status as s
    WHERE s.status = 'REG'
    AND s.data_hora::date BETWEEN '${startDate}'
    AND '${endDate}') as Registrado,

    (SELECT COUNT(*) as n_registrado FROM status as s
    WHERE s.status <> 'REG'
    AND s.data_hora::date BETWEEN '${startDate}'
    AND '${endDate}') as N_Registrado

    FROM status as s
    WHERE s.data_hora::date BETWEEN '${startDate}'
    AND '${endDate}'
    GROUP BY s.data_hora::date
    ORDER BY COUNT(*) ASC;`
*/