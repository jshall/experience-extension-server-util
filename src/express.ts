// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.

import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { authorize } from './jwt.js';

import { getLogger } from './log.js';
const logger = getLogger();

declare module "express-serve-static-core" {
    interface Request {
        jwt?: ReturnType<typeof authorize>;
    }
}
type AuthorizedRequest = Request

export function jwtAuthorize({ options }: { options: Parameters<typeof authorize>[1] }) {
    return function (request: Request, response: Response, next: NextFunction) {
        const { headers: { authorization: lowerAuthorization, Authorization: upperAuthorization } = {} } = request;

        const authorization = lowerAuthorization || upperAuthorization || '';

        // eslint-disable-next-line no-unused-vars
        const [bearer, authorizationToken] = (authorization instanceof Array ? (authorization[0] || '') : authorization).split(' ');

        if (bearer !== 'Bearer' || !authorizationToken) {
            const message = 'missing Authorization Bearer token';
            logger.error(message);
            response.status(StatusCodes.FORBIDDEN).send(JSON.stringify({ message }));
            next(message);
        } else

            try {
                const decodedJwt = authorize(authorizationToken, options);

                request.jwt = decodedJwt;
                next();
            } catch (error: any) {
                const message = `Authorization token failed: ${error.message || error}`;
                logger.error(message);
                response.set('Content-Type', 'application/json')
                response.status(StatusCodes.FORBIDDEN).send(JSON.stringify({ error: message }));
                next(error);
            }
    }
}
