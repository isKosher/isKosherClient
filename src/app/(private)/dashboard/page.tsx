// app/dashboard/page.tsx
import { cookies } from "next/headers";
import axiosInstance from "@/utils/axiosConfig";
import DashboardClient from "./dashboardClient";

async function getUserBusinesses(cookieHeader: string) {
  try {
    const response = await axiosInstance.get(
      "/api/v1/admin/businesses/my-businesses",
      {
        headers: {
          Cookie: cookieHeader,
        },
      }
    );
    return response.data.content ?? [];
  } catch (error) {
    console.error("Error fetching businesses:", error);
    return [];
  }
}

export default async function DashboardPage() {
  // Retrieve cookies from the incoming request
  const cookieStore = await cookies();
  const cookieList = cookieStore.getAll();
  // Manually build a cookie header string (e.g., "token=abc; session=123")
  const cookieHeader = cookieList
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  // Use the cookie header to authenticate your Axios request
  const userBusinesses = await getUserBusinesses(cookieHeader);

  return <DashboardClient userBusinesses={userBusinesses} />;
}
