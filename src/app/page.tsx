import ErrorPage from "@/components/ErrorPage";
import HomePage from "@/components/homePage";

// Mark the page component as async to properly handle dynamic data
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Create a serializable version of searchParams
  const filters = await searchParams;
  let tab: "text" | "location" | "filter" = "text";
  if (filters.tab) {
    tab = filters.tab.toString() as "text" | "location" | "filter";
  }
  try {
    return <HomePage tab={tab} />;
  } catch (error) {
    console.error("Error in PageContent:", error);
    return <ErrorPage />;
  }
}
