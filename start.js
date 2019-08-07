// our libraries
const Logger = require('./logger');

// third party libraries
const Cloudflare = require('cloudflare');
const dotenv = require('dotenv');
const pick = require('lodash.pick');
const publicIp = require('public-ip');

// constants
const DEFAULT_UPDATE_INTERVAL = 1000 * 60 * 60;
const RECORD_TYPES = ['A', 'CNAME'];

const logger = new Logger('start');

dotenv.config();
const cloudflare = new Cloudflare({
  email: process.env.CF_EMAIL,
  key: process.env.CF_KEY,
  // undocumented in our README for now, but should work
  token: process.env.CF_TOKEN
});

const updateInterval = parseInt(process.env.UPDATE_INTERVAL, 10) || DEFAULT_UPDATE_INTERVAL;
async function doUpdate() {
  const zoneName = process.env.CF_ZONE;
  const recordName = process.env.CF_RECORD_NAME;
  const recordType = (process.env.CF_RECORD_TYPE || 'A').toUpperCase();
  const fullRecordName = recordName && recordName !== '@' ? `${recordName}.${zoneName}` : zoneName;

  if (!RECORD_TYPES.includes(recordType)) {
    logger.error(`error: record type must be one of: ${RECORD_TYPES.join(', ')}`);
    process.exit(1);
    return;
  }

  logger.info('updating...');

  try {
    const zones = (await cloudflare.zones.browse()).result;
    const zone = zones.find((zone) => zone.name === zoneName);

    if (!zone) {
      logger.warn(`no matching zone found with name ${zoneName}, retrying in ${updateInterval}ms`);
      return;
    }

    try {
      const records = (await cloudflare.dnsRecords.browse(zone.id)).result;
      const record = records.find((record) => record.name === fullRecordName && record.type === recordType);

      if (!record) {
        logger.warn(`no matching record with name ${fullRecordName} and type ${recordType}, retrying in ${updateInterval}ms`);
        return;
      }

      try {
        const ip = await publicIp.v4();

        try {
          await cloudflare.dnsRecords.edit(zone.id, record.id, {
            content: ip,
            ...pick(record, ['name', 'proxied', 'ttl', 'type'])
          });
        } catch (error) {
          logger.error(`error while updating record, retrying in ${updateInterval}ms`, {
            error
          });
          return;
        }
      } catch (error) {
        logger.error(`error while retrieving public ip address, retrying in ${updateInterval}ms`, {
          error
        });
        return;
      }
    } catch (error) {
      logger.error(`error while fetching records, retrying in ${updateInterval}ms`, {
        error
      });
      return;
    }
  } catch (error) {
    logger.error(`error while fetching zones, retrying in ${updateInterval}ms`, {
      error
    });
    return;
  }

  logger.info(`updated successfully, updating again in ${updateInterval}ms`);
}

doUpdate();
setInterval(doUpdate, updateInterval);
