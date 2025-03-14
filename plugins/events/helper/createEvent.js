'use strict';

const { updateBuildAndTriggerDownstreamJobs } = require('../../builds/helper/updateBuild');
const { Status, BUILD_STATUS_MESSAGES } = require('../../builds/triggers/helpers');

/**
 * @typedef {import('screwdriver-models/lib/event')} Event
 */

/**
 * Create a new event.
 * Updates the status of all the virtual builds at the beginning of the event workflow to "SUCCESS"
 * and trigger their downstream jobs.
 *
 * @method createEvent
 * @param   {Object}    config
 * @param   {String}    config.username
 * @param   {Object}    config.scmContext
 * @param   {Object}    server
 * @returns {Promise<Event>} Newly created event
 */
async function createEvent(config, server) {
    const { eventFactory } = server.app;
    const { username, scmContext } = config;
    const event = await eventFactory.create(config);

    if (event.builds) {
        const virtualJobBuilds = event.builds.filter(b => b.status === 'CREATED');

        for (const build of virtualJobBuilds) {
            await updateBuildAndTriggerDownstreamJobs(
                {
                    status: Status.SUCCESS,
                    statusMessage: BUILD_STATUS_MESSAGES.SKIP_VIRTUAL_JOB.statusMessage,
                    statusMessageType: BUILD_STATUS_MESSAGES.SKIP_VIRTUAL_JOB.statusMessageType
                },
                build,
                server,
                username,
                scmContext
            );
        }
    }

    return event;
}

module.exports = {
    createEvent
};
