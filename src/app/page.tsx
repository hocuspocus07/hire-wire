import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import Image from "next/image";

export default function Home() {
  return (
    <>
    <Hero/>
    <Features/>
    <HowItWorks/>
    </>
  );
}
