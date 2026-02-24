/** @format */

import Image from "next/image";

export default function LoadingPage() {
  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 bg-white flex items-center justify-center flex-col gap-3">
      <Image
        src="/logo-bgn.png"
        alt="logo"
        width={50}
        height={50}
        className="animate-spin-slow"
      />
      <h1 className="text-gray-600 font-[600] text-[24px]">Loading...</h1>
    </div>
  );
}
