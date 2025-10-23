import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import HeroSection from "@/components/hero-section";
import TechStackSection from "@/components/tech-stack-section";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If user is authenticated, redirect to dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <>
      <HeroSection />
      <TechStackSection />
    </>
  );
}