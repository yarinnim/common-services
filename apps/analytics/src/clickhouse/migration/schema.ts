export const ANALYTICS_HOURLY_TABLE = 'analytics_hourly';
export const ANALYTICS_LIFETIME_TABLE = 'analytics_lifetime';
export const DEVICE_ONLINE_TABLE = 'device_online';

/** Latest presence per device for real-time online user queries. */
export const DEVICE_ONLINE_COLUMNS = `
  device_id String,
  last_seen DateTime DEFAULT now(),
  device_type LowCardinality(String) DEFAULT 'Unknown',
  os LowCardinality(String) DEFAULT 'Unknown',
  browser LowCardinality(String) DEFAULT 'Unknown',
  country LowCardinality(String) DEFAULT 'unknown',
  language LowCardinality(String) DEFAULT 'unknown'
`;

/** All dimensions live as columns on hourly/lifetime tables — no *_stat_* tables. */
export const ANALYTICS_DIMENSION_COLUMNS = `
  user_agent String,
  device_id LowCardinality(String),
  country LowCardinality(String),
  language LowCardinality(String),
  referer LowCardinality(String),
  origin LowCardinality(String),
  ip LowCardinality(String),
  url LowCardinality(String)
`;

export const ANALYTICS_DIMENSION_ORDER = `
  country,
  language,
  device_id,
  ip,
  origin,
  referer,
  url,
  user_agent
`;
