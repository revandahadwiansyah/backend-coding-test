'use strict'

const express = require('express')
const app = express()
const maxLimit = 10

const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

module.exports = (db, logger) => {
    app.get('/health', async (req, res) => {
        logger.info('API[GET]: health')
        return new Promise((resolve,reject) => {
            try{
                resolve(res.send('health'))
            }catch(e){
                logger.error(e)
                resolve(res.send({
                    error_code: 'CATCH_ERROR',
                    message: e,
                }))
            }
        })
    })

    app.post('/rides', jsonParser, async (req, res) => {
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

        const insertData = await insertRiders(db, logger, req.body);
        
        const response = await getRiderDetails(db, logger, insertData);
        res.send(response)
    })

    app.get('/rides', async (req, res) => {
        logger.info('API[GET]: rides')
        logger.info(`params: ${JSON.stringify(req.query)}`)
        const response = await getRiders(db, logger, req.query);
        res.send(response)
    })

    app.get('/rides/:id', async (req, res) => {
        Logger.info(`API[GET]: rides/${req.params.id}`)
        logger.info(`params: ${JSON.stringify(req.params)}`)
        const response = await getRiderDetails(db, logger, req.params);
        res.send(response)
        
    })

    return app
}

async function getRiders(db, logger, params) {
    logger.info(`getRiders(): ${JSON.stringify(params)}`)
    return new Promise((resolve,reject) => {
        try{
            var sqlQueries = `SELECT * FROM Rides Limit ${maxLimit}`;
            if(typeof params.pages != 'undefined'){
                sqlQueries += ` offset ${parseInt(params.pages)}`
            }

            db.all(sqlQueries, (err, rows) => {
                if (err) {
                    logger.error(err)
                    reject({
                        error_code: 'SERVER_ERROR',
                        message: 'Unknown error',
                    })
                }

                if (rows.length === 0) {
                    logger.warn(`Rows: ${rows.length}`)
                    reject({
                        error_code: 'RIDES_NOT_FOUND_ERROR',
                        message: 'Could not find any rides',
                    })
                }
                resolve(rows)
            })
        }catch(e){
            logger.error(e)
            reject({
                error_code: 'CATCH_ERROR',
                message: e,
            })
        }
    })
}

async function getRiderDetails(db, logger, params) {
    logger.info(`getRiders(): ${JSON.stringify(params)}`)
    return new Promise((resolve,reject) => {
        try{
            db.all(
            `SELECT * FROM Rides WHERE rideID='${req.params.id}'`,
            function (err, rows) {
                if (err) {
                    logger.error(err)
                    reject({
                        error_code: 'SERVER_ERROR',
                        message: 'Unknown error',
                    })
                }

                if (rows.length === 0) {
                    logger.warn(`Rows: ${rows.length}`)
                    reject({
                        error_code: 'RIDES_NOT_FOUND_ERROR',
                        message: 'Could not find any rides',
                    })
                }
                resolve(rows)
            })
        }catch(e){
            logger.error(e)
            reject({
                error_code: 'CATCH_ERROR',
                message: e,
            })
        }
    })
}

async function insertRiders(db, logger, params) {
    logger.info(`getRiders(): ${JSON.stringify(params)}`)
    return new Promise((resolve,reject) => {
        try{
            var values = [
                params.start_lat,
                params.start_long,
                params.end_lat,
                params.end_long,
                params.rider_name,
                params.driver_name,
                params.driver_vehicle,
            ]

            db.all(
            'INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)',
            values,
            function (err, rows) {
                if (err) {
                    logger.error(err)
                    reject({
                        error_code: 'SERVER_ERROR',
                        message: 'Unknown error',
                    })
                }
                resolve(this.lastID)
            })
        }catch(e){
            logger.error(e)
            reject({
                error_code: 'CATCH_ERROR',
                message: e,
            })
        }
    })
}
