require('dotenv').config()

const { Client } = require('pg')

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
})

client.connect((err) => {
    if (err) {
        console.log("*******************************");
        console.error('* Database connection error *\n\n', err.stack)
        console.log("*******************************");
    } else {
        console.log("*****************************************");
        console.log("* Server Status - Started on port: " + process.env.APP_PORT + " * \n* Database: " + client.database + " is connected  *")
        console.log("*****************************************\n\n");
    }
})

module.exports = {
    query: (text, values, callback) => {
        return client.query(text, values, callback)
    },
    queryAsync: (text, values) => client.query(text, values)
}

/**
 * CREATE TABLE status(
	id BIGSERIAL NOT NULL,
	status CHARACTER VARYING(128) NOT NULL,
	data_hora DATE NOT NULL,
	PRIMARY KEY (id)
);
 */