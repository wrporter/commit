import { OAuth2Strategy } from "remix-auth-oauth2";

/**
 * @see https://developers.google.com/identity/protocols/oauth2/scopes
 */
export type GoogleScope = string;

export type GoogleStrategyOptions = {
  clientId: string;
  clientSecret: string;
  redirectURI: string;
  /**
   * @default "openid profile email"
   */
  scope?: GoogleScope[] | string;
  accessType?: "online" | "offline";
  includeGrantedScopes?: boolean;
  prompt?: "none" | "consent" | "select_account";
  hd?: string;
  loginHint?: string;
};

export type GoogleProfile = {
  provider: string;
  id: string;
  displayName: string;
  name: {
    familyName: string;
    givenName: string;
  };
  emails: [{ value: string }];
  photos: [{ value: string }];
  _json: {
    sub: string;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    locale: string;
    email: string;
    email_verified: boolean;
    hd: string;
  };
};

export type GoogleExtraParams = {
  expires_in: 3920;
  token_type: "Bearer";
  scope: string;
  id_token: string;
} & Record<string, string | number>;

export const GoogleStrategyScopeSeperator = " ";
export const GoogleStrategyDefaultScopes = [
  "openid",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
];
export const GoogleStrategyDefaultName = "google";

export class GoogleStrategy<User> extends OAuth2Strategy<User> {
  public name = GoogleStrategyDefaultName;

  private readonly accessType: string;

  private readonly prompt?: "none" | "consent" | "select_account";

  private readonly includeGrantedScopes: boolean;

  private readonly hd?: string;

  private readonly loginHint?: string;

  private readonly userInfoURL =
    "https://www.googleapis.com/oauth2/v3/userinfo";

  constructor(
    {
      clientId,
      clientSecret,
      redirectURI,
      scope,
      accessType,
      includeGrantedScopes,
      prompt,
      hd,
      loginHint,
    }: GoogleStrategyOptions,
    verify: (profile: GoogleProfile) => Promise<User>
  ) {
    super(
      {
        clientId,
        clientSecret,
        scopes: parseScope(scope),
        authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenEndpoint: "https://oauth2.googleapis.com/token",
        redirectURI,
      },
      async ({ tokens }) => {
        // @ts-ignore
        return verify(await this.getUserProfile(tokens?.data?.access_token));
      }
    );
    this.accessType = accessType ?? "online";
    this.includeGrantedScopes = includeGrantedScopes ?? false;
    this.prompt = prompt;
    this.hd = hd;
    this.loginHint = loginHint;
  }

  protected authorizationParams(
    params: URLSearchParams,
    request: Request
  ): URLSearchParams {
    const result = super.authorizationParams(params, request);
    result.set("access_type", this.accessType);
    result.set("include_granted_scopes", String(this.includeGrantedScopes));

    if (this.prompt) {
      params.set("prompt", this.prompt);
    }
    if (this.hd) {
      params.set("hd", this.hd);
    }
    if (this.loginHint) {
      params.set("login_hint", this.loginHint);
    }
    return params;
  }

  protected async getUserProfile(accessToken: string): Promise<GoogleProfile> {
    const response = await fetch(this.userInfoURL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const raw: GoogleProfile["_json"] = await response.json();
    return {
      provider: "google",
      id: raw.sub,
      displayName: raw.name,
      name: {
        familyName: raw.family_name,
        givenName: raw.given_name,
      },
      emails: [{ value: raw.email }],
      photos: [{ value: raw.picture }],
      _json: raw,
    } satisfies GoogleProfile;
  }
}

// Allow users the option to pass a scope string, or typed array
function parseScope(scope?: string | string[]) {
  if (!scope) {
    return GoogleStrategyDefaultScopes;
  } else if (Array.isArray(scope)) {
    return scope;
  }
  return scope.split(GoogleStrategyScopeSeperator);
}
