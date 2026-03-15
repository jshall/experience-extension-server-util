// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.

import got, { type OptionsOfJSONResponseBody } from 'got';
import { StatusCodes } from 'http-status-codes';
import type { ExperienceJwt } from './jwt.js';
import { getLogger, type Logger } from './log.js';

const baseOptions: Require<OptionsOfJSONResponseBody, 'headers'> = {
    responseType: 'json',
    throwHttpErrors: false,
    headers: {
        Accept: 'application/json',
    }
};

type ConfigurationInputs = { jwt?: ExperienceJwt, token: string, url: string, logger?: Logger };
export async function getCardServerConfiguration<T extends Record<string, any>>({ jwt, token, url, logger = getLogger() }: ConfigurationInputs) {
    const configUrl = url || jwt?.card?.cardServerConfigurationApiUrl;

    if (!configUrl) {
        throw new Error('getCardServerConfiguration url or Experience jwt is required');
    }

    // get card server configuration, which should have the apiKey
    const options = { ...baseOptions };
    options.headers.Authorization = `Bearer ${token}`;

    logger.debug('getCardServerConfiguration url:', configUrl);

    const response = await got.get<T>(configUrl, options);
    if (response.statusCode === StatusCodes.OK) {
        const { body: config } = response;

        const logConfig: Record<string, any> = { ...config };
        for (const key in logConfig) {
            if (key.toLocaleLowerCase().endsWith('key')) {
                logConfig[key] = '*****';
            }
        }
        logger.debug('getCardServerConfiguration configuration:', logConfig);
        return { config };
    } else {
        return {
            error: {
                message: `failed to get card configuration status: ${response.statusCode}`,
                statusCode: response.statusCode
            }
        }
    }
}
