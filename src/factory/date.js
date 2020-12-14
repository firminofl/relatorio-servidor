const dateInBr = (dateInTimeStamp) => {
    const date = new Date(dateInTimeStamp)
    const year = `${(((date.getDate() + 1) < 10 ? '0' : '') + (date.getDate() + 1))}/${((date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1))}/${date.getFullYear()}`

    return `${year}`
}

const timeStampToString = () => {
    const date = new Date()
    const year = `${date.getFullYear()}-${((date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1))}-${((date.getDate() < 10 ? '0' : '') + date.getDate())}`

    return `${year}`;
}

const dateWithHours = (date) => {
    const year = `${date.getFullYear()}-${((date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1))}-${((date.getDate() < 10 ? '0' : '') + date.getDate())}`
    const hours = `${date.getHours() < 10 ? ('0' + date.getHours()) : date.getHours()}:${date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes()}:${date.getSeconds() < 10 ? ('0' + date.getSeconds()) : date.getSeconds()}`

    return `${year} ${hours}`;
}

const dateWithOutHours = (date) => {
    const year = `${date.getFullYear()}-${((date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1))}-${((date.getDate() < 10 ? '0' : '') + date.getDate())}`

    return `${year}`;
}

const dateWithOnlyHours = (date) => {
    const hours = `${date.getHours() < 10 ? ('0' + date.getHours()) : date.getHours()}:${date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes()}`

    return `${hours}`;
}

module.exports = {
    dateInBr,
    timeStampToString,
    dateWithHours,
    dateWithOnlyHours,
    dateWithOutHours
}