import { OrderDetailsService } from "@/lib/api";
import { JWTService } from "@/lib/services/JWTService";
import type { OrderDetailsPageProps } from "@/types/details/orderdetails/index.types";
import { cookies } from "next/headers";
import { Suspense } from "react";
import OrderDetailsClient from "./components/OrderDetailsClient";

async function getOrderDetails(orderId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) return null;

  try {
    const jwtService = JWTService.getInstance();
    const payload = jwtService.decodeToken(token);

    if (!payload) return null;

    const userId = Number(payload.sub || payload.userId || payload.id);
    const companyId = Number(payload.companyId);
    const tenantCode = payload.iss;

    if (!userId || !companyId || !tenantCode) return null;

    return await OrderDetailsService.fetchOrderDetailsWithContext(
      { userId, tenantId: tenantCode, companyId, orderId },
      { accessToken: token, userId, companyId, tenantCode }
    );
  } catch (error) {
    console.error("Error fetching order details on server:", error);
    return null;
  }
}

export default async function OrderDetailsPage({
  params,
}: OrderDetailsPageProps) {
  const resolvedParams = await params;
  const initialOrderDetails = await getOrderDetails(resolvedParams.orderId);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background p-6">
          <div className="space-y-4">
            <div className="h-12 w-64 bg-muted animate-pulse rounded" />
            <div className="h-96 w-full bg-muted animate-pulse rounded" />
          </div>
        </div>
      }
    >
      <OrderDetailsClient
        params={params}
        initialOrderDetails={initialOrderDetails}
      />
    </Suspense>
  );
}
