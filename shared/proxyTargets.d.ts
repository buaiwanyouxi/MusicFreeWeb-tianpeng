export interface ProxyTargetConfig {
  target: string
  headers?: Record<string, string>
  allowHtml?: boolean
  secure?: boolean
  devOnly?: boolean
}

export declare const PROXY_TARGETS: Record<string, ProxyTargetConfig>
export declare const LEGACY_PROXY_MAP: Record<string, string>
export declare const COMMON_HEADERS: Record<string, string>
