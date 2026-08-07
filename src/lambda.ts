// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.

import type { MiddlewareObj, Request } from '@middy/core';
import type { APIGatewayProxyEvent } from 'aws-lambda';
import { StatusCodes } from 'http-status-codes';
import { authorize, type ExperienceJwt } from './jwt.js';

export class HTTPError extends Error {
    statusCode?: number;
}

export type AuthorizedEvent = APIGatewayProxyEvent & { jwt: ExperienceJwt };
export function jwtAuthorizeMiddy({
    options = {},
}: {
    options: Parameters<typeof authorize>[1];
}): MiddlewareObj<AuthorizedEvent> {
    function before(request: Request<AuthorizedEvent>) {
        const {
            event: { headers: { authorization = '' } = {} },
        } = request;

        const [bearer, authorizationToken] = authorization.split(' ');

        if (bearer !== 'Bearer' || !authorizationToken) {
            const message = 'missing Authorization Bearer token';
            const throwError = new HTTPError(JSON.stringify({ error: { message } }));
            throwError.statusCode = StatusCodes.FORBIDDEN;
            throw throwError;
        }

        try {
            const decodedJwt = authorize(authorizationToken, options);
            request.event.jwt = decodedJwt as unknown as ExperienceJwt;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            const message = `Authorization token failed: ${error.message}`;
            const throwError = new HTTPError(JSON.stringify({ error: { message } }));
            throwError.statusCode = StatusCodes.FORBIDDEN;

            throw throwError;
        }
    }

    return { before };
}

const contentTypeJsonHeader = { 'Content-Type': 'application/json' };

type Headers = Record<string, string | string[] | undefined>;
export type Response = {
    statusCode: number;
    headers: Headers;
    body?: string | unknown;
};
export const buildResponse = ({ statusCode, headers = {}, body }: Response) => {
    const response: Response = {
        statusCode: statusCode,
        headers: { ...contentTypeJsonHeader, ...headers },
    };

    if (body) {
        response.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    return response;
};
