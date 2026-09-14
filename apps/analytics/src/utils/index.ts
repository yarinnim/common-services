export type ParsedUserAgent = {
  browser: string;
  version: string;
  os: string;
  deviceType: string;
  isBot: boolean;
};

/**
 * Parses a User-Agent string to extract device, OS, browser, and bot data.
 *
 * @example
 * parseUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)');
 */
export const parseUserAgent = (ua: string): ParsedUserAgent => {
  const result: ParsedUserAgent = {
    browser: 'Unknown',
    version: 'Unknown',
    os: 'Unknown',
    deviceType: 'Desktop',
    isBot: false,
  };

  if (!ua || typeof ua !== 'string') return result;

  // 1. Bot/Crawler Configurations
  const botKeywords = [
    'bot',
    'crawler',
    'spider',
    'slurp',
    'googlebot',
    'bingbot',
    'yandex',
    'baidu',
    'facebookexternalhit',
    'twitterbot',
    'linkedinbot',
    'curl',
    'wget',
    'python-requests',
    'scrapy',
    'headlesschrome',
    'lighthouse',
  ];
  const botRegex = new RegExp(botKeywords.join('|'), 'i');
  
  if (botRegex.test(ua)) {
    return { ...result, isBot: true, deviceType: 'Bot' };
  }

  // 2. Operating System Matchers
  const osRules = [
    { regex: /windows nt/i, value: 'Windows' },
    {
      regex: /macintosh|mac os x/i,
      value: 'macOS',
    },
    { regex: /iphone|ipad|ipod/i, value: 'iOS' },
    { regex: /android/i, value: 'Android' },
    { regex: /linux/i, value: 'Linux' },
    { regex: /crkey|googletv|smarttv|appletv|roku|tizen/i, value: 'SmartTV OS' },
  ];

  const matchedOS = osRules.find((rule) => rule.regex.test(ua));
  result.os = matchedOS ? matchedOS.value : 'Unknown';

  // 3. Device Type Matchers
  const deviceRules = [
    { regex: /smarttv|googletv|appletv|hbbtv|pov_tv|netcast|webos|tizen|roku/i, value: 'SmartTV' },
    { regex: /ipad|tablet|playbook|silk/i, value: 'Tablet' },
    {
      regex: /android(?!.*mobile)/i,
      value: 'Tablet',
    },
    {
      regex: /mobile|iphone|ipod|iemobile|blackberry|fennec|opera mini/i,
      value: 'Mobile',
    },
  ];

  const matchedDevice = deviceRules.find((rule) => rule.regex.test(ua));
  result.deviceType = matchedDevice ? matchedDevice.value : 'Desktop';

  // 4. Browser & Version Matchers
  const browserRules = [
    {
      name: 'Microsoft Edge',
      regex: /(edg|edge|edgios|edga)\/(\d+(\.\d+)*)/i,
      versionIndex: 2,
    },
    {
      name: 'Opera',
      regex: /(opr|opera)\/(\d+(\.\d+)*)/i,
      versionIndex: 2,
    },
    {
      name: 'Google Chrome',
      regex: /(?:chrome|crios|crmo)\/(\d+(\.\d+)*)/i,
      versionIndex: 1,
      exclude: /edg/i, // Edge includes 'Chrome' token, so skip if it's Edge
    },
    {
      name: 'Mozilla Firefox',
      regex: /(?:firefox|fxios)\/(\d+(\.\d+)*)/i,
      versionIndex: 1,
    },
    {
      name: 'Safari',
      regex: /version\/(\d+(\.\d+)*).*safari/i,
      versionIndex: 1,
      exclude: /chrome|crios|crmo|edg/i,
    },
    {
      name: 'Internet Explorer',
      regex: /(?:msie\s|rv:)(\d+(\.\d+)*)/i,
      versionIndex: 1,
    },
  ];

  const matchedBrowser = browserRules.find((rule) => {
    if (rule.exclude && rule.exclude.test(ua)) return false;
    return rule.regex.test(ua);
  });

  if (matchedBrowser) {
    result.browser = matchedBrowser.name;
    const versionMatch = ua.match(matchedBrowser.regex);
    result.version = versionMatch ? versionMatch[matchedBrowser.versionIndex] : 'Unknown';
  }

  return result;
};

