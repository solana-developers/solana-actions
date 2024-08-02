import { ACTIONS_CORS_HEADERS, BLOCKCHAIN_IDS } from "./constants.js";

type HeaderHelperArgs = {
  headers?: typeof ACTIONS_CORS_HEADERS;
  chainId?: keyof typeof BLOCKCHAIN_IDS | string;
  actionVersion?: string | number;
};

/**
 * Construct valid headers for use with Action APIs
 */
export function createActionHeaders({
  headers,
  chainId,
  actionVersion,
}: HeaderHelperArgs = {}) {
  if (chainId) {
    headers = Object.assign({}, headers || {}, {
      "X-Blockchain-Ids": Object.hasOwn(BLOCKCHAIN_IDS, chainId)
        ? BLOCKCHAIN_IDS[chainId as keyof typeof BLOCKCHAIN_IDS]
        : chainId,
    });
  }
  if (actionVersion) {
    headers = Object.assign({}, headers || {}, {
      "X-Action-Version": actionVersion.toString(),
    });
  }
  if (headers) return Object.assign({}, ACTIONS_CORS_HEADERS, headers);
  else return ACTIONS_CORS_HEADERS;
}

/**
 * Middleware to enable proper CORS headers for Action APIs
 */
export function actionCorsMiddleware(args: HeaderHelperArgs) {
  return (_req: any, res: any, next: Function) => {
    res.set(createActionHeaders(args));
    next();
  };
}
