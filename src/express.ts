// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.

import { type NextFunction, type Request, type Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { authorize } from './jwt.js';
import { getLogger, type Logger } from './log.js';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            jwt?: ReturnType<typeof authorize>;
        }
    }
}

export function jwtAuthorize({
    options,
    logger = getLogger(),
}: {
    options: Parameters<typeof authorize>[1];
    logger?: Logger;
}) {
    return function (request: Request, response: Response, next: NextFunction) {
        const { headers: { authorization: lowerAuthorization, Authorization: upperAuthorization } = {} } = request;

        const authorization = lowerAuthorization || upperAuthorization || '';
        const [bearer, authorizationToken] = (
            authorization instanceof Array ? authorization.at(-1) || '' : authorization
        ).split(' ');

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
            } catch (error) {
                const message = `Authorization token failed: ${error.message || error}`;
                logger.error(message);
                response.set('Content-Type', 'application/json');
                response.status(StatusCodes.FORBIDDEN).send(JSON.stringify({ error: message }));
                next(error);
            }
    };
}
