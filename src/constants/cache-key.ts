const SYSTEM_NAME = 'SeaPack';

class CacheKey {
  static readonly TOKEN = `${SYSTEM_NAME}-token-key`;
  static readonly VISITED_VIEWS = `${SYSTEM_NAME}-visited-views-key`;
  static readonly CACHED_VIEWS = `${SYSTEM_NAME}-cached-views-key`;
}

export default CacheKey;
