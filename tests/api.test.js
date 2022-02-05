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
        it('should return health', (done) => {
            request(app)
                .get('/health')
                .expect('Content-Type', /text/)
                .send()
                .expect(200, done)
                .end((err, res) => {
                    expressWinstonLoggger(res)
                    if(err)
                        expressWinstonLoggger(err)
                        return done(err)

                    done()
                })
        })
    })
})

function expressWinstonLoggger(formatter){
    var opt = {
        file:{
            level: 'info',
            filename: `${appRoot}/logs/app.log`,
            handleExpections: true,
            json: true,
            maxsize: 5242880 //5MB        
        },
        console: {
            level: 'debug',
            handleExpections: true,
            json: true
        }
    }
    return expressWinston.logger({
      transports: [
        new winston.transports.File(opt.file),
        new winston.transports.Console(opt.console)
      ],
      format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss.SSS'
        }),
        winston.format.colorize(),
        winston.format.json()
      ),
      meta: true,
      msg: 'HTTP {{req.method}} {{req.url}}',
      expressFormat: true
    })
}