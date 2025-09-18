import { NextResponse } from "next/server";

export async function GET() {
  // mock data – replace with DB call later
  const profile = {
    name: "Admin User",
    email: "admin@example.com",
    phone: "9876543210",
    altPhone: "9123456789",
    altEmail: "alt@example.com",
    avatar: null,
  };

  return NextResponse.json(profile);
}
