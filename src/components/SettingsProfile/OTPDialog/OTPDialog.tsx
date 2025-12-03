"use client";

import { ActionDialog } from "@/components/dialogs/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BaseDialogProps } from "@/types/dialog";
import { Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export interface OTPDialogProps
  extends Omit<BaseDialogProps, "title" | "description"> {
  onVerify: (otp: string) => Promise<void>;
  onResend?: () => Promise<void>;
  title: string;
  description?: string;
  isLoading?: boolean;
  otp: string;
  setOtp: (otp: string) => void;
}

export function OTPDialog({
  otp,
  setOtp,
  open,
  onOpenChange,
  onVerify,
  onResend,
  title,
  description,
  isLoading = false,
}: OTPDialogProps) {
  const t = useTranslations("profileSettings");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) return;

    setIsVerifying(true);
    try {
      await onVerify(otp);
      handleClose();
    } catch {
      // Error handling should be done by parent component
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (onResend) {
      try {
        await onResend();
      } catch {
        // Error handling should be done by parent component
      }
    }
  };

  const handleClose = () => {
    setOtp("");
    onOpenChange(false);
  };

  return (
    <ActionDialog
      open={open}
      onOpenChange={handleClose}
      title={
        <span className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {title}
        </span>
      }
      description={description}
      size="sm"
      actions={
        <>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading || isVerifying}
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleVerify}
            disabled={isLoading || isVerifying || !otp || otp.length !== 6}
          >
            {isVerifying ? t("verifying") : t("verifyOtp")}
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="otp">{t("enterOtp")}</Label>
          {onResend && (
            <Button
              variant="link"
              size="sm"
              onClick={handleResend}
              disabled={isLoading || isVerifying}
              className="h-auto p-0 text-xs"
            >
              {t("resendOtp")}
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
          disabled={isLoading || isVerifying}
          autoFocus
        />
      </div>
    </ActionDialog>
  );
}
