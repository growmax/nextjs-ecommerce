"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";

const createLoginSchema = (t: (key: string) => string) =>
  z.object({
    emailOrPhone: z
      .string()
      .min(1, t("auth.emailRequired"))
      .refine(
        value => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const phoneRegex = /^[\d\s\-\+\(\)]+$/;
          return emailRegex.test(value) || phoneRegex.test(value);
        },
        {
          message: t("auth.emailInvalid"),
        }
      ),
    password: z.string().optional(),
  });

type LoginFormData = {
  emailOrPhone: string;
  password?: string | undefined;
};

interface UserInfo {
  isNewUser: boolean;
  hasPassword: boolean;
  reqOtp: boolean;
}

export default function LoginPage() {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [_userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [currentUsername, setCurrentUsername] = useState("");
  const { login } = useAuth();

  const loginSchema = createLoginSchema(t);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrPhone: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    // Validate password if password field is shown
    if (showPasswordField && !data.password) {
      form.setError("password", {
        type: "manual",
        message: t("auth.passwordRequired"),
      });
      setIsLoading(false);
      return;
    }

    try {
      // Step 1: Check username if we haven't already
      if (!showPasswordField) {
        const response = await fetch("/api/auth/check-username", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          cache: "no-store",
          body: JSON.stringify({
            UserName: data.emailOrPhone,
          }),
        });

        const responseData = await response.json();

        if (response.ok && responseData.data) {
          const userData = responseData.data;
          setUserInfo(userData);
          setCurrentUsername(data.emailOrPhone);

          // Check if password is required
          if (userData.hasPassword === true) {
            setShowPasswordField(true);
          } else if (userData.reqOtp === true) {
            // TODO: Redirect to OTP page
          }
        }
      } else {
        // Step 2: Submit with password
        const loginResponse = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          cache: "no-store",
          body: JSON.stringify({
            username: currentUsername,
            password: data.password,
          }),
        });

        const loginData = await loginResponse.json();

        if (loginResponse.ok) {
          // Show success toast
          toast.success(t("messages.success"), {
            description: t("auth.loginSuccess"),
            duration: 4000,
          });

          // Check if OTP is still required after password
          if (loginData.data && loginData.data.reqOtp === true) {
            toast.info(t("auth.otpRequired"), {
              description: t("auth.otpDescription"),
              duration: 5000,
            });
            // TODO: Redirect to OTP page with session token
          } else {
            // Store auth token and user data, then redirect to dashboard
            if (loginData.tokens && loginData.tokens.accessToken) {
              const payload = loginData.tokens.payload;
              const userData = {
                id: payload.id || payload.sub || "",
                email: payload.email || currentUsername,
                phone: payload.phoneNumber,
                name: payload.displayName || "",
                role: payload.accountRole || payload.roleName || "user",
                companyName: payload.companyName,
                companyId: payload.companyId,
                picture: payload.picture,
              };

              // Calculate expiresIn from JWT exp claim
              const expiresIn = payload.exp
                ? payload.exp - Math.floor(Date.now() / 1000)
                : 3600;

              // Get redirect URL from query params if available
              const searchParams = new URLSearchParams(window.location.search);
              const from = searchParams.get("from");

              // Store auth data first
              login(
                {
                  accessToken: loginData.tokens.accessToken,
                  refreshToken: loginData.tokens.refreshToken,
                  expiresIn,
                },
                userData
              );

              // Use window.location for faster redirect
              const redirectUrl = from || "/dashboard";
              window.location.href = redirectUrl;
            } else {
              toast.error(t("auth.authError"), {
                description: t("auth.tokenError"),
                duration: 4000,
              });
            }
          }
        } else {
          // Show error toast
          toast.error(t("auth.loginFailed"), {
            description: loginData.message || t("auth.invalidCredentials"),
            duration: 4000,
          });

          // Show error message to user
          form.setError("password", {
            type: "manual",
            message: loginData.message || t("auth.invalidPassword"),
          });
        }
      }
    } catch {
      // Show network error toast
      toast.error(t("messages.error"), {
        description: t("auth.connectionError"),
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Toaster richColors position="top-right" />
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            {t("auth.signIn")}
          </CardTitle>
          <CardDescription>
            {showPasswordField
              ? t("auth.enterPassword", { username: currentUsername })
              : t("auth.enterEmailPhone")}
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="emailOrPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.emailPhone")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("auth.emailPlaceholder")}
                        {...field}
                        disabled={isLoading || showPasswordField}
                        readOnly={showPasswordField}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showPasswordField && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth.password")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder={t("auth.passwordPlaceholder")}
                            {...field}
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>

            <CardFooter className="pt-6">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading
                  ? t("messages.loading")
                  : showPasswordField
                    ? t("auth.signIn")
                    : t("buttons.continue")}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
