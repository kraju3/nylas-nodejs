import APIClient from '../src/apiClient.js';
import { Auth } from '../src/resources/auth.js';
import {
  CodeExchangeRequest,
  ServerSideHostedAuthRequest,
  TokenExchangeRequest,
} from '../src/models/auth.js';
import sha256 from 'sha256';
jest.mock('uuid', () => ({ v4: (): string => '123456789' }));

describe('Auth', () => {
  let apiClient: APIClient;
  let auth: Auth;

  beforeAll(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
    });

    auth = new Auth(apiClient, 'clientId', 'clientSecret');
    jest.spyOn(APIClient.prototype, 'request').mockResolvedValue({});
  });

  describe('Exchanging tokens', () => {
    describe('exchangeCodeForToken', () => {
      it('should call apiClient.request with the correct params', async () => {
        const payload: CodeExchangeRequest = {
          redirectUri: 'https://redirect.uri/path',
          code: 'code',
        };
        await auth.exchangeCodeForToken(payload);

        expect(apiClient.request).toHaveBeenCalledWith({
          method: 'POST',
          path: '/v3/connect/token',
          body: {
            clientId: 'clientId',
            clientSecret: 'clientSecret',
            redirectUri: 'https://redirect.uri/path',
            code: 'code',
            grantType: 'authorization_code',
          },
        });
      });

      it('should set codeVerifier', async () => {
        const payload: CodeExchangeRequest = {
          redirectUri: 'https://redirect.uri/path',
          code: 'code',
          codeVerifier: 'codeVerifier',
        };
        await auth.exchangeCodeForToken(payload);

        expect(apiClient.request).toHaveBeenCalledWith({
          method: 'POST',
          path: '/v3/connect/token',
          body: {
            clientId: 'clientId',
            clientSecret: 'clientSecret',
            redirectUri: 'https://redirect.uri/path',
            code: 'code',
            grantType: 'authorization_code',
            codeVerifier: 'codeVerifier',
          },
        });
      });
    });

    describe('refreshAccessToken', () => {
      it('should call apiClient.request with the correct params', async () => {
        const payload: TokenExchangeRequest = {
          redirectUri: 'https://redirect.uri/path',
          refreshToken: 'refreshToken',
        };
        await auth.refreshAccessToken(payload);

        expect(apiClient.request).toHaveBeenCalledWith({
          method: 'POST',
          path: '/v3/connect/token',
          body: {
            clientId: 'clientId',
            clientSecret: 'clientSecret',
            redirectUri: 'https://redirect.uri/path',
            refreshToken: 'refreshToken',
            grantType: 'refresh_token',
          },
        });
      });
    });
  });
  describe('Validating token', () => {
    describe('validateIDToken', () => {
      it('should call apiClient.request with the correct params', async () => {
        await auth.validateIDToken('id123');

        expect(apiClient.request).toHaveBeenCalledWith({
          method: 'GET',
          path: '/v3/connect/tokeninfo',
          queryParams: {
            idToken: 'id123',
          },
        });
      });
    });

    describe('validateAccessToken', () => {
      it('should call apiClient.request with the correct params', async () => {
        await auth.validateAccessToken('accessToken123');

        expect(apiClient.request).toHaveBeenCalledWith({
          method: 'GET',
          path: '/v3/connect/tokeninfo',
          queryParams: {
            accessToken: 'accessToken123',
          },
        });
      });
    });
  });
  describe('URL building', () => {
    describe('urlForAuthentication', () => {
      it('should build the correct url', () => {
        const url = auth.urlForAuthentication({
          redirectUri: 'https://redirect.uri/path',
          scope: ['calendar'],
          provider: 'google',
          includeGrantScopes: true,
        });

        expect(url).toBe(
          'https://test.api.nylas.com/v3/connect/auth?client_id=clientId&redirect_uri=https%3A%2F%2Fredirect.uri%2Fpath&access_type=online&response_type=code&provider=google&scope=calendar'
        );
      });

      it('should build the correct url if all the fields are set', () => {
        const url = auth.urlForAuthentication({
          redirectUri: 'https://redirect.uri/path',
          scope: ['calendar'],
          provider: 'google',
          loginHint: 'loginHint',
          includeGrantScopes: true,
          prompt: 'prompt',
          metadata: 'metadata',
          state: 'state',
          accessType: 'online',
        });

        expect(url).toBe(
          'https://test.api.nylas.com/v3/connect/auth?client_id=clientId&redirect_uri=https%3A%2F%2Fredirect.uri%2Fpath&access_type=online&response_type=code&provider=google&login_hint=loginHint&include_grant_scopes=true&scope=calendar&prompt=prompt&metadata=metadata&state=state'
        );
      });
    });

    describe('urlForAuthenticationPKCE', () => {
      it('should hash the secret and build the URL correctly', () => {
        const pkce = auth.urlForAuthenticationPKCE({
          redirectUri: 'https://redirect.uri/path',
          scope: ['calendar'],
          provider: 'google',
          includeGrantScopes: true,
        });
        const codeChallenge = Buffer.from(sha256('123456789')).toString(
          'base64'
        );

        expect(pkce).toEqual({
          secret: '123456789',
          secretHash: codeChallenge,
          url:
            'https://test.api.nylas.com/v3/connect/auth?client_id=clientId&redirect_uri=https%3A%2F%2Fredirect.uri%2Fpath&access_type=online&response_type=code&provider=google&scope=calendar&code_challenge_method=s256&code_challenge=123456789',
        });
      });
    });

    describe('urlForAdminConsent', () => {
      it('should build the correct url', () => {
        const url = auth.urlForAdminConsent({
          redirectUri: 'https://redirect.uri/path',
          scope: ['calendar'],
          loginHint: 'loginHint',
          includeGrantScopes: true,
          prompt: 'prompt',
          metadata: 'metadata',
          state: 'state',
          credentialId: 'credentialId',
        });

        expect(url).toBe(
          'https://test.api.nylas.com/v3/connect/auth?client_id=clientId&redirect_uri=https%3A%2F%2Fredirect.uri%2Fpath&access_type=online&response_type=adminconsent&provider=microsoft&login_hint=loginHint&include_grant_scopes=true&scope=calendar&prompt=prompt&metadata=metadata&state=state&credential_id=credentialId'
        );
      });
    });
  });
  describe('hostedAuth', () => {
    it('should call apiClient.request with the correct params', async () => {
      const hostedAuthRequest: ServerSideHostedAuthRequest = {
        redirectUri: 'https://redirect.uri/path',
        state: 'state',
        loginHint: 'loginHint',
        cookieNonce: 'nonce',
        scope: ['calendar'],
        provider: 'google',
      };
      await auth.serverSideHostedAuth(hostedAuthRequest);

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/connect/auth',
        body: {
          redirectUri: 'https://redirect.uri/path',
          state: 'state',
          loginHint: 'loginHint',
          cookieNonce: 'nonce',
          scope: ['calendar'],
          provider: 'google',
        },
      });
    });
  });
  describe('revoke', () => {
    it('should call apiClient.request with the correct params', async () => {
      await auth.revoke('accessToken123');

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/connect/revoke',
        queryParams: {
          token: 'accessToken123',
        },
      });
    });
  });
  describe('checkAuthCredentials', () => {
    it('should throw an error if no clientId', () => {
      const authNoClientId = new Auth(apiClient, '', 'clientSecret');
      expect(() => authNoClientId.urlForAuthentication({} as any)).toThrowError(
        'ClientID & ClientSecret are required for using auth'
      );
    });

    it('should throw an error if no clientSecret', () => {
      const authNoClientSecret = new Auth(apiClient, 'clientId', '');
      expect(() =>
        authNoClientSecret.urlForAuthentication({} as any)
      ).toThrowError('ClientID & ClientSecret are required for using auth');
    });
  });
});
