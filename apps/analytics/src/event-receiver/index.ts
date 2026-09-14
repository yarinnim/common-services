/* eslint-disable no-console */
import { eventReceiver } from '@core/event';
import { EVENT_EXCHANGE } from '../constants';
import { findByCode } from '../models/application.model';
import { type Application } from '../models/application.model';
import { createHourlyAnalytics } from '../clickhouse/model/analytics-hourly.model';
import { createLifetimeAnalytics } from '../clickhouse/model/analytics-lifetime.model';
import { createDeviceOnline } from '../clickhouse/model/device-online.model';
import { type AnalyticsEventData } from '../clickhouse/model/analytics-event-data.type';

const createAnalytics = (appId: number, data: AnalyticsEventData) => (
  createHourlyAnalytics(appId, data)
    .then(() => createLifetimeAnalytics(appId, data))
    .then(() => createDeviceOnline(appId, data))
);

export default function initEventReceiver(con: any) {
  const event = eventReceiver({
    connection: con,
    eventExchange: EVENT_EXCHANGE,
  });

  const { addEventListener } = event;
  addEventListener('request-log', (data: any) => {
    const { appName } = data;
    // const appName = '@media-services/media-api';
    return findByCode(appName)
      .then((app: Application | undefined) => {
        if (!app) throw new Error(`Application (${appName}) not found`);
        return app.id;
      })
      .then((appId: number) => {
        const { message } = data;
        const eventData = message as AnalyticsEventData;
        return createAnalytics(appId, eventData);
      })
      .then(() => {
        console.log('[INFO] Hourly, lifetime and device online statistics written.');
      })
      .catch((error: Error) => {
        const { message } = error;
        console.error(`[ERROR] ${message}`);
      });
  });
}
