'use strict'

const express = require('express')
const app = express()
const maxLimit = 10

const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

module.exports = (db, logger) => {
    app.get('/health', (req, res) => {
        logger.info('API[GET]: health')
        res.send('Healthy')
    })

    app.post('/rides', jsonParser, (req, res) => {
        logger.info('API[POST]: rides')
        logger.info(`params: ${JSON.stringify(req.body)}`)
        const startLatitude = Number(req.body.start_lat)
        const startLongitude = Number(req.body.start_long)
        const endLatitude = Number(req.body.end_lat)
        const endLongitude = Number(req.body.end_long)
        const riderName = req.body.rider_name
        const driverName = req.body.driver_name
        const driverVehicle = req.body.driver_vehicle

        if (
            startLatitude < -90 ||
            startLatitude > 90 ||
            startLongitude < -180 ||
            startLongitude > 180
        ) {
            var msg = 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
            logger.warn(msg)
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message:
                    msg,
            })
        }

        if (
            endLatitude < -90 ||
            endLatitude > 90 ||
            endLongitude < -180 ||
            endLongitude > 180
        ) {
            var msg = 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
            logger.warn(msg)
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message:
                    msg,
            })
        }

        if (typeof riderName !== 'string' || riderName.length < 1) {
            var msg = 'Rider name must be a non empty string'
            logger.warn(msg)
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: msg,
            })
        }

        if (typeof driverName !== 'string' || driverName.length < 1) {
            var msg = 'Rider name must be a non empty string'
            logger.warn(msg)
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: msg,
            })
        }

        if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
            var msg = 'Rider name must be a non empty string'
            logger.warn(msg)
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: msg,
            })
        }

        var values = [
            req.body.start_lat,
            req.body.start_long,
            req.body.end_lat,
            req.body.end_long,
            req.body.rider_name,
            req.body.driver_name,
            req.body.driver_vehicle,
        ]

        const result = db.run(
            'INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)',
            values,
            function (err) {
                if (err) {
                    logger.error(err)
                    return res.send({
                        error_code: 'SERVER_ERROR',
                        message: 'Unknown error',
                    })
                }

                db.all(
                    'SELECT * FROM Rides WHERE rideID = ?',
                    this.lastID,
                    function (err, rows) {
                        if (err) {
                            logger.error(err)
                            return res.send({
                                error_code: 'SERVER_ERROR',
                                message: 'Unknown error',
                            })
                        }

                        res.send(rows)
                    }
                )
            }
        )
    })

    app.get('/rides', (req, res) => {
        logger.info('API[GET]: rides')
        logger.info(`params: ${JSON.stringify(req.query)}`)
        var sqlQueries = `SELECT * FROM Rides Limit ${maxLimit}`;
        if(typeof req.query.pages != 'undefined'){
            sqlQueries += ` offset ${parseInt(req.query.pages)}`
        }
        db.all(sqlQueries, function (err, rows) {
            if (err) {
                logger.error(err)
                return res.send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error',
                })
            }

            if (rows.length === 0) {
                logger.warn(`Rows: ${rows.length}`)
                return res.send({
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: 'Could not find any rides',
                })
            }

            res.send(rows)
        })
    })

    app.get('/rides/:id', (req, res) => {
        Logger.info(`API[GET]: rides/${req.params.id}`)
        logger.info(`params: ${JSON.stringify(req.params)}`)
        db.all(
            `SELECT * FROM Rides WHERE rideID='${req.params.id}'`,
            function (err, rows) {
                if (err) {
                    logger.error(err)
                    return res.send({
                        error_code: 'SERVER_ERROR',
                        message: 'Unknown error',
                    })
                }

                if (rows.length === 0) {
                    logger.warn(`Rows: ${rows.length}`)
                    return res.send({
                        error_code: 'RIDES_NOT_FOUND_ERROR',
                        message: 'Could not find any rides',
                    })
                }

                res.send(rows)
            }
        )
    })

    return app
}
