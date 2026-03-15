// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.

import log, { type LogLevelDesc } from 'loglevel';

export function getLogger(name?: string) {
    return name ? log.getLogger(name) : log;
}

export function initializeLogging(name: string) {
    const logger = getLogger(name);
    logger.setLevel(process.env.LOG_LEVEL as LogLevelDesc || (process.env.NODE_ENV === 'development' ? 'debug' : 'warn'));
    const level = logger.getLevel();
    const levelName = (Object.keys(logger.levels) as (keyof typeof logger.levels)[]).find(key => logger.levels[key] === level);

    logger.info(name ? `${name} log level:` : 'log level:', levelName);
}
