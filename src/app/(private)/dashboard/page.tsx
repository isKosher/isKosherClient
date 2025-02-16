import { getMyRestaurants } from "./actionsDashboard";
import DashboardClient from "./dashboardClient";

export default async function DashboardPage() {
  let userBusinesses = null;

  try {
    userBusinesses = await getMyRestaurants();
  } catch (error) {
    console.error("Error fetching businesses:", error);
  }

  if (!userBusinesses) {
    return <div>Please log in to view your dashboard</div>;
  }

  return <DashboardClient userBusinesses={userBusinesses} />;
}
