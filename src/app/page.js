import Image from "next/image";
import Logger from "@/components/logger/logger";
import Header from "@/components/header/header";
import Head from "next/head";

export default function Home() {
  return (
   <>
   <Header />
   <Logger />
   </>
  );
}
