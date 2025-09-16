// src/app/en/company/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CompanyPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Company Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Company Page (English)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Welcome to our company! Here you can add company information, team
              members, or any content you like.
            </p>

            <h2 className="text-lg font-semibold mb-2">About Us</h2>
            <p className="mb-4">
              Our company specializes in delivering high-quality products and
              services to our clients.
            </p>

            <h2 className="text-lg font-semibold mb-2">Contact</h2>
            <p>Email: contact@company.com</p>
            <p>Phone: +1 234 567 890</p>
          </CardContent>
        </Card>

        {/* Navigation Button */}
        <div>
          <Link href="/en">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
