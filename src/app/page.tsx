import ErrorPage from "@/components/ErrorPage";
import HomePage from "@/components/homePage";

export default function Page() {
  return <PageContent />;
}

async function PageContent() {
  try {
    return <HomePage />;
  } catch (error) {
    return <ErrorPage />;
  }
}
