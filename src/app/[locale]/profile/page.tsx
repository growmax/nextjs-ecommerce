// src/app/en/profile/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  // State to store form input
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
    phone: "",
  });

  const [submitted, setSubmitted] = useState(false);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle profile submission logic here
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div>
                <h2 className="text-lg font-semibold mb-2">Profile Created!</h2>
                <p>
                  <strong>Name:</strong> {profile.name}
                </p>
                <p>
                  <strong>Email:</strong> {profile.email}
                </p>
                <p>
                  <strong>Role:</strong> {profile.role}
                </p>
                <p>
                  <strong>Phone:</strong> {profile.phone}
                </p>
                <Button className="mt-4" onClick={() => setSubmitted(false)}>
                  Edit Profile
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">Name</label>
                  <Input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Email</label>
                  <Input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Role</label>
                  <Input
                    type="text"
                    name="role"
                    value={profile.role}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Phone</label>
                  <Input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                  />
                </div>

                <Button type="submit" className="mt-2">
                  Create Profile
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
