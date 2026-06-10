/**
 * Built-in AuthService types.
 *
 * The PHP server auto-registers this service when
 * `RpcServer::useAuthentication()` is called. These types ship with
 * the client package so you never need to run codegen against the
 * vendor directory.
 *
 * Usage:
 *
 * ```typescript
 * import {
 *     createContractProxy,
 *     AuthServiceProxy,
 *     AuthServiceConfig,
 * } from '@php-websocket-rpc/client';
 *
 * const auth = createContractProxy<AuthServiceProxy>(client, AuthServiceConfig);
 *
 * const token = await auth.authenticate('my-jwt-token');
 * console.log(token.subject); // user identifier
 * console.log(token.expiresAt); // expiry timestamp
 *
 * // Refresh the token before it expires
 * const refreshed = await auth.refresh('my-jwt-token');
 *
 * auth.logout();
 * ```
 */

import type { ProxyOptions } from './types';

// ─── Response type ────────────────────────────────────────────

/**
 * Token value object returned by `authenticate()` and `refresh()`.
 *
 * Matches `PhpWebsocketRpc\Rpc\Auth\Token` on the PHP side.
 * The server sends it as `[FQCN, props]` on the wire, which the
 * client already decodes into a plain object with this shape.
 */
export interface AuthToken {
    /** Unique token identifier */
    id: string;
    /** Token issuer */
    issuer: string;
    /** Subject identifier (user ID, email, etc.) */
    subject: string;
    /** Intended audience */
    audience: string;
    /** Expiry Unix timestamp */
    expiresAt: number;
    /** Not-before Unix timestamp */
    notBefore: number;
    /** Issued-at Unix timestamp */
    issuedAt: number;
}

// ─── Proxy interface ──────────────────────────────────────────

/**
 * Proxy interface for the built-in AuthService contract.
 *
 * Methods:
 * - `authenticate(token)` — login with a token, returns a Token
 * - `refresh(token)` — refresh an expiring token, returns a new Token
 * - `logout()` — clear the auth state for the current connection
 */
export interface AuthServiceProxy {
    /**
     * Authenticate with a token and return token data.
     *
     * On success the server stores the user in the client's session,
     * making protected methods (those marked with `#[NeedAuthorization]`)
     * accessible.
     *
     * @param token The authentication token (JWT, session ID, etc.)
     * @returns The token metadata (id, subject, expiry, etc.)
     */
    authenticate(token: string): Promise<AuthToken>;

    /**
     * Refresh an expiring authentication token.
     *
     * @param token The current authentication token
     * @returns A new Token with updated expiry
     */
    refresh(token: string): Promise<AuthToken>;

    /**
     * Clear the authentication state for the current connection.
     *
     * After calling this, protected methods will require a new
     * `authenticate()` call.
     */
    logout(): void;
}

// ─── Proxy config ─────────────────────────────────────────────

/**
 * ProxyOptions for the built-in AuthService contract.
 *
 * Pass this directly to `createContractProxy()`:
 * ```typescript
 * const auth = createContractProxy<AuthServiceProxy>(client, AuthServiceConfig);
 * ```
 */
export const AuthServiceConfig = {
    /** Matches the PHP FQCN: `PhpWebsocketRpc\Rpc\Contract\AuthService` */
    service: 'PhpWebsocketRpc\\Rpc\\Contract\\AuthService',
    call: ['authenticate', 'refresh'],
    notify: ['logout'],
} satisfies ProxyOptions;
