// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.

import jwt from 'jsonwebtoken';

export type ExperienceJwt = {
    tenant: { id: string; };
    user: { id: string; erpId: string; roles: string[]; };
    card: { cardServerConfigurationApiUrl: string; };
};

type AuthorizeOptions = { secret?: string; ignoreExpiration?: boolean; };
export function authorize(token: string, options: AuthorizeOptions) {
    const {
        secret = process.env.JWT_SECRET,
        ignoreExpiration = ['yes', 'y', 'true', 't', '1'].includes(process.env.IGNORE_JWT_EXPIRATION?.toLowerCase() || '')
    } = options;

    if (!secret) throw 'No token provided'

    return jwt.verify(token, secret, { algorithms: ['HS256'], ignoreExpiration });
}