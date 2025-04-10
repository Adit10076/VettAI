import { redirect } from "next/navigation";
import { auth } from "../auth";
import LandingPage from "./components/LandingPage";

export default async function Home() {
  const session = await auth();
  
  // Redirect authenticated users to dashboard
  if (session) {
    redirect("/dashboard");
  }
  
  // Landing page for unauthenticated users
  return <LandingPage />;
}
