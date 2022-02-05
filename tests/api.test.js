'use strict'

const request = require('supertest')

const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database(':memory:')

const app = require('../src/app')(db)
const buildSchemas = require('../src/schemas')

const { ESLint } = require('eslint')
const eslint = new ESLint()
const winston = require('winston')
const expressWinston = require('express-winston')
const appRoot = require('app-root-path')
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

describe('API tests', () => {
    before((done) => {
        db.serialize((err) => {
            if (err) {
                return done(err)
            }

            buildSchemas(db)

            done()
        })
    })

    describe('GET /health', (done) => {
        logger.info('API[GET]: health')
        it('should return health', (done) => {
            request(app)
                .get('/health')
                .expect('Content-Type', /text/)
                .send()
                .expect(200, done)
                .end((err, res) => {
                    if(err){
                        logger.error(err)
                        return done(err)
                    }

                    done()
                })
        })
    })
})