import { AnonymousTokenResponse } from "@/types/appconfig";
import { authClient, createClientWithContext, RequestContext } from "../client";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: {
    id: string;
    email?: string;
    name?: string;
    role?: string;
  };
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn?: number;
}

export class AuthService {
  private static instance: AuthService;

  private constructor() { }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Get anonymous token for unauthenticated requests
   */
  async getAnonymousToken(origin: string): Promise<AnonymousTokenResponse> {
    const response = await authClient.get("/anonymous", {
      headers: { origin },
    });
    return response.data;
  }

  /**
   * Login user with username and password
   */
  async login(
    loginData: LoginRequest,
    origin?: string
  ): Promise<LoginResponse> {
    const response = await authClient.post(
      "/loginNew",
      {
        UserName: loginData.username,
        Password: loginData.password,
      },
      {
        headers: {
          ...(origin && { Origin: origin }),
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
    return response.data;
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await authClient.post("/refresh", {
      refreshToken,
    });
    return response.data;
  }

  /**
   * Logout user
   */
  async logout(context?: RequestContext): Promise<void> {
    if (context?.accessToken) {
      const client = createClientWithContext(authClient, context);
      await client.post("/logout");
    }
  }

  /**
   * Validate token
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await authClient.get("/validate", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * Check if username is available
   */
  async checkUsername(username: string): Promise<{ available: boolean }> {
    const response = await authClient.get(`/check-username/${username}`);
    return response.data;
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<{ success: boolean }> {
    const response = await authClient.post("/reset-password", { email });
    return response.data;
  }

  /**
   * Change password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string,
    context: RequestContext
  ): Promise<{ success: boolean }> {
    const client = createClientWithContext(authClient, context);
    const response = await client.post("/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  }

  /**
   * Verify reset password with OTP
   */
  async verifyReset(params: {
    UserName: string;
    Otp: string;
    Password: string;
  }): Promise<unknown> {
    const response = await authClient.post("/auth/verifyReset", {
      UserName: params.UserName,
      Otp: params.Otp,
      Password: params.Password,
    });
    return response.data;
  }
}

export default AuthService.getInstance();
