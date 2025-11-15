import Link from "next/link"
import CardDemo from "@/components/login-card"

export default function LoginPage() {
  return (
  <div className="relative min-h-screen bg-background flex flex-col items-center">
      {/* Left vertical line */}
      <div className="w-[1px] h-full absolute left-4 sm:left-6 md:left-8 lg:left-0 top-0 bg-[rgba(55,50,47,0.12)] shadow-[1px_0px_0px_white] z-0"></div>

      {/* Right vertical line */}
      <div className="w-[1px] h-full absolute right-4 sm:right-6 md:right-8 lg:right-0 top-0 bg-[rgba(55,50,47,0.12)] shadow-[1px_0px_0px_white] z-0"></div>

      <div className="self-stretch pt-[9px] overflow-hidden border-b border-[rgba(55,50,47,0.06)] flex flex-col justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-[66px] relative z-10">
        {/* Navigation */}
        <div className="w-full h-12 sm:h-14 md:h-16 lg:h-[84px] absolute left-0 top-0 flex justify-center items-center z-20 px-6 sm:px-8 md:px-12 lg:px-0">
          <div className="w-full h-0 absolute left-0 top-6 sm:top-7 md:top-8 lg:top-[42px] border-t border-[rgba(55,50,47,0.12)] shadow-[0px_1px_0px_white]"></div>

          <div className="w-full max-w-[calc(100%-32px)] sm:max-w-[calc(100%-48px)] md:max-w-[calc(100%-64px)] lg:max-w-[700px] lg:w-[700px] h-10 sm:h-11 md:h-12 py-1.5 sm:py-2 px-3 sm:px-4 md:px-4 pr-2 sm:pr-3 bg-background backdrop-blur-sm shadow-[0px_0px_0px_2px_white] overflow-hidden rounded-[50px] flex justify-between items-center relative z-30">
            <div className="flex justify-center items-center">
              <div className="flex justify-start items-center">
                <div className="flex flex-col justify-center text-[#2F3037] text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-5 font-sans">
                  StudyWise
                </div>
              </div>
            </div>
            <div className="h-6 sm:h-7 md:h-8 flex justify-start items-start gap-2 sm:gap-3">
              <Link
                href="/"
                className="px-2 sm:px-3 md:px-[14px] py-1 sm:py-[6px] bg-white shadow-[0px_1px_2px_rgba(55,50,47,0.12)] overflow-hidden rounded-full flex justify-center items-center"
              >
                <span className="flex flex-col justify-center text-[#37322F] text-xs md:text-[13px] font-medium leading-5 font-sans">
                  Home
                </span>
              </Link>
            </div>
          </div>
        </div>
        {/* Spacer to ensure content sits below the absolute nav */}
        <div className="h-12 sm:h-14 md:h-16 lg:h-[84px]" />
      </div>

      {/* Page content */}
      <main className="flex-1 w-full flex items-center justify-center p-4 relative z-10">
        <CardDemo />
      </main>
    </div>
  )
}
