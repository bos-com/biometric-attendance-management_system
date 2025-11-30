import Image from "next/image";
import VideoCapture from "@/components/VideoCapture/VideoCapture";

export default function Home() {
  return (
    <div className="flex h-screen   items-center justify-center bg-zinc-50 font-sans dark:bg-black">
     <VideoCapture />
    </div>
  );
}
