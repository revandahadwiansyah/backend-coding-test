'use strict'

const express = require('express')
const app = express()
const port = 8010
const { ESLint } = require('eslint')
const eslint = new ESLint()
const winston = require('winston')
const expressWinston = require('express-winston')
const appRoot = require('app-root-path')

const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('db.sqlite', (err) => {
    if(err)
        return console.log(err.message);

    console.log('Connection DB Established')
})
const buildSchemas = require('./src/schemas')

const logger = winston.createLogger({
    transports: [
        new winston.transports.File({
            level: 'info',
            filename: `${appRoot}/logs/app.log`,
            handleExpections: true,
            json: true,
            maxsize: 5242880 //5MB   
        }),
        new winston.transports.Console()
    ]
})

db.serialize(() => {
    buildSchemas(db)

    const app = require('./src/app')(db, logger)

    app.listen(port, () =>
        console.log(`App started and listening on port ${port}`)
    )
})
