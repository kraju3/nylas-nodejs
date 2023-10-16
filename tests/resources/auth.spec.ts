import APIClient from '../../src/apiClient';
import { Auth } from '../../src/resources/auth';
import {
  CodeExchangeRequest,
  TokenExchangeRequest,
} from '../../src/models/auth';
jest.mock('uuid', () => ({ v4: (): string => 'nylas' }));

describe('Auth', () => {
  let apiClient: APIClient;
  let auth: Auth;

  beforeAll(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
    });

    auth = new Auth(apiClient);
    jest.spyOn(APIClient.prototype, 'request').mockResolvedValue({});
  });

  describe('Exchanging tokens', () => {
    describe('exchangeCodeForToken', () => {
      it('should call apiClient.request with the correct params', async () => {
        const payload: CodeExchangeRequest = {
          clientId: 'clientId',
          clientSecret: 'clientSecret',
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
          clientId: 'clientId',
          clientSecret: 'clientSecret',
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
          clientId: 'clientId',
          clientSecret: 'clientSecret',
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
  // describe('Validating token', () => {
  //   describe('validateIDToken', () => {
  //     it('should call apiClient.request with the correct params', async () => {
  //       await auth.validateIDToken('id123');
  //
  //       expect(apiClient.request).toHaveBeenCalledWith({
  //         method: 'GET',
  //         path: '/v3/connect/tokeninfo',
  //         queryParams: {
  //           idToken: 'id123',
  //         },
  //       });
  //     });
  //   });
  //
  //   describe('validateAccessToken', () => {
  //     it('should call apiClient.request with the correct params', async () => {
  //       await auth.validateAccessToken('accessToken123');
  //
  //       expect(apiClient.request).toHaveBeenCalledWith({
  //         method: 'GET',
  //         path: '/v3/connect/tokeninfo',
  //         queryParams: {
  //           accessToken: 'accessToken123',
  //         },
  //       });
  //     });
  //   });
  // });
  describe('URL building', () => {
    describe('urlForAuthentication', () => {
      it('should build the correct url', () => {
        const url = auth.urlForOAuth2({
          clientId: 'clientId',
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
        const url = auth.urlForOAuth2({
          clientId: 'clientId',
          redirectUri: 'https://redirect.uri/path',
          scope: ['calendar'],
          provider: 'google',
          loginHint: 'loginHint',
          includeGrantScopes: true,
          prompt: 'prompt',
          state: 'state',
          accessType: 'online',
        });

        expect(url).toBe(
          'https://test.api.nylas.com/v3/connect/auth?client_id=clientId&redirect_uri=https%3A%2F%2Fredirect.uri%2Fpath&access_type=online&response_type=code&provider=google&login_hint=loginHint&include_grant_scopes=true&scope=calendar&prompt=prompt&state=state'
        );
      });
    });

    describe('urlForAuthenticationPKCE', () => {
      it('should hash the secret and build the URL correctly', () => {
        const pkce = auth.urlForOAuth2PKCE({
          clientId: 'clientId',
          redirectUri: 'https://redirect.uri/path',
          scope: ['calendar'],
          provider: 'google',
          includeGrantScopes: true,
        });
        const codeChallenge =
          'ZTk2YmY2Njg2YTNjMzUxMGU5ZTkyN2RiNzA2OWNiMWNiYTliOTliMDIyZjQ5NDgzYTZjZTMyNzA4MDllNjhhMg';

        expect(pkce).toEqual({
          secret: 'nylas',
          secretHash: codeChallenge,
          url: `https://test.api.nylas.com/v3/connect/auth?client_id=clientId&redirect_uri=https%3A%2F%2Fredirect.uri%2Fpath&access_type=online&response_type=code&provider=google&scope=calendar&code_challenge_method=s256&code_challenge=${codeChallenge}`,
        });
      });
    });

    describe('urlForAdminConsent', () => {
      it('should build the correct url', () => {
        const url = auth.urlForAdminConsent({
          clientId: 'clientId',
          redirectUri: 'https://redirect.uri/path',
          scope: ['calendar'],
          loginHint: 'loginHint',
          includeGrantScopes: true,
          prompt: 'prompt',
          state: 'state',
          credentialId: 'credentialId',
        });

        expect(url).toBe(
          'https://test.api.nylas.com/v3/connect/auth?client_id=clientId&redirect_uri=https%3A%2F%2Fredirect.uri%2Fpath&access_type=online&response_type=adminconsent&provider=microsoft&login_hint=loginHint&include_grant_scopes=true&scope=calendar&prompt=prompt&state=state&credential_id=credentialId'
        );
      });
    });
  });
  describe('Detect Provider', () => {
    it('should call apiClient.request with the correct params', async () => {
      await auth.detectProvider({
        email: 'email@example.com',
        clientId: 'testClientId',
        allProviderTypes: true,
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
});