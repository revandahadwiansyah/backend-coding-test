'use strict'

const express = require('express')
const app = express()
const port = 8010
//const { ESLint } = require('eslint')
//const eslint = new ESLint()
const winston = require('winston')
const expressWinston = require('express-winston')

const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

const sqlite3s = require('sqlite3').verbose()
const db = new sqlite3.Database(':memory:')

const buildSchemas = require('./src/schemas')

db.serialize(() => {
    buildSchemas(db)

    const app = require('./src/app')(db)

    app.listen(port, () =>
        console.log(`App started and listening on port ${port}`)
    )
})
