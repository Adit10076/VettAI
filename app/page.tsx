import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import LandingPage from "./components/LandingPage";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  // Redirect authenticated users to dashboard
  if (session) {
    redirect("/dashboard");
  }
  
  // Landing page for unauthenticated users
  return <LandingPage />;
}
