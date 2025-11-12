"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";
import { useState } from "react";

interface OTPDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: (otp: string) => Promise<void>;
  onResend?: () => Promise<void>;
  title: string;
  description?: string;
  isLoading?: boolean;
}

export function OTPDialog({
  open,
  onOpenChange,
  onVerify,
  onResend,
  title,
  description,
  isLoading = false,
}: OTPDialogProps) {
  const [otp, setOtp] = useState("");
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {title}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="otp">Enter OTP *</Label>
              {onResend && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleResend}
                  disabled={isLoading || isVerifying}
                  className="h-auto p-0 text-xs"
                >
                  Resend OTP
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
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              disabled={isLoading || isVerifying}
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading || isVerifying}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerify}
              disabled={isLoading || isVerifying || otp.length !== 6}
            >
              {isVerifying ? "Verifying..." : "Verify OTP"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
