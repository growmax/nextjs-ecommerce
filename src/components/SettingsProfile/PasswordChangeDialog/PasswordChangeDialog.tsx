"use client";

import { ActionDialog } from "@/components/dialogs/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BaseDialogProps } from "@/types/dialog";
import { useFormValidation } from "@/hooks/Forms/useFormValidation";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Lock, Shield } from "lucide-react";
import { useState } from "react";

export interface PasswordChangeDialogProps
  extends Omit<BaseDialogProps, "title" | "description"> {
  onPasswordChange: (data: {
    otp: string;
    newPassword: string;
  }) => Promise<void>;
  onSendOtp?: () => Promise<void>;
  userName?: string;
}

export function PasswordChangeDialog({
  open,
  onOpenChange,
  onPasswordChange,
  onSendOtp,
  userName: _userName,
}: PasswordChangeDialogProps) {
  const t = useTranslations("profileSettings");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { validatePassword, validateOTP } = useFormValidation();

  const handlePasswordChange = async () => {
    const otpError = validateOTP(otp);
    const passwordError = validatePassword(newPassword);

    if (otpError || passwordError) return;

    if (newPassword !== confirmPassword) return;

    setIsLoading(true);
    try {
      await onPasswordChange({ otp, newPassword });
      handleClose();
    } catch {
      // Error handling should be done by parent component
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (onSendOtp) {
      try {
        await onSendOtp();
      } catch {
        // Error handling should be done by parent component
      }
    }
  };

  const handleClose = () => {
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    onOpenChange(false);
  };

  const isFormValid =
    otp.length === 6 &&
    newPassword.length >= 6 &&
    newPassword === confirmPassword;

  return (
    <ActionDialog
      open={open}
      onOpenChange={handleClose}
      title={
        <span className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {t("changePasswordTitle")}
        </span>
      }
      description={t("enterOtpAndSetPassword")}
      size="sm"
      actions={
        <>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            {t("cancel")}
          </Button>
          <Button
            onClick={handlePasswordChange}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? t("changing") : t("changePasswordTitle")}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* OTP Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="otp">{t("enterOtp")}</Label>
            {onSendOtp && (
              <Button
                variant="link"
                size="sm"
                onClick={handleSendOtp}
                disabled={isLoading}
                className="h-auto p-0 text-xs"
              >
                {t("sendOtp")}
              </Button>
            )}
          </div>
          <Input
            id="otp"
            type="text"
            value={otp}
            onChange={e => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 6);
              setOtp(value);
            }}
            placeholder={t("enter6DigitOtp")}
            maxLength={6}
            disabled={isLoading}
            autoFocus
          />
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <Label htmlFor="newPassword">{t("newPassword")}</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder={t("enterNewPassword")}
              className="pl-10 pr-10"
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("minimum6CharactersRequired")}
          </p>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder={t("confirmNewPassword")}
              className="pl-10 pr-10"
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
          {newPassword &&
            confirmPassword &&
            newPassword !== confirmPassword && (
              <p className="text-xs text-red-500">{t("passwordsDoNotMatch")}</p>
            )}
        </div>
      </div>
    </ActionDialog>
  );
}
