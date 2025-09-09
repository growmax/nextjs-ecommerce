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

const loginSchema = z.object({
  emailOrPhone: z
    .string()
    .min(1, "Email or phone number is required")
    .refine(
      value => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        return emailRegex.test(value) || phoneRegex.test(value);
      },
      {
        message: "Please enter a valid email or phone number",
      }
    ),
  password: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface UserInfo {
  isNewUser: boolean;
  hasPassword: boolean;
  reqOtp: boolean;
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [_userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [currentUsername, setCurrentUsername] = useState("");

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
        message: "Password is required",
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
          toast.success("Login Successful!", {
            description: "Welcome back! You have been logged in successfully.",
            duration: 4000,
          });

          // Check if OTP is still required after password
          if (loginData.data && loginData.data.reqOtp === true) {
            toast.info("OTP Required", {
              description: "Please check your phone for the verification code.",
              duration: 5000,
            });
            // TODO: Redirect to OTP page with session token
          } else {
            // TODO: Store auth token and redirect to dashboard
          }
        } else {
          // Show error toast
          toast.error("Login Failed", {
            description:
              loginData.message ||
              "Invalid email or password. Please try again.",
            duration: 4000,
          });

          // Show error message to user
          form.setError("password", {
            type: "manual",
            message: loginData.message || "Invalid password",
          });
        }
      }
    } catch {
      // Show network error toast
      toast.error("Connection Error", {
        description:
          "Unable to connect to the server. Please check your internet connection.",
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
          <CardTitle className="text-3xl font-bold">Sign in</CardTitle>
          <CardDescription>
            {showPasswordField
              ? `Enter your password for ${currentUsername}`
              : "Enter your email or phone number to continue"}
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
                    <FormLabel>Email or Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter email or phone number"
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
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
                  ? "Loading..."
                  : showPasswordField
                    ? "Sign In"
                    : "Continue"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
