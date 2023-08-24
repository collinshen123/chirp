import { SignOutButton } from "@clerk/nextjs";
import { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <main className="overflow-hidden flex h-screen justify-center">
      <div className="flex h-full w-full flex-col border-x border-slate-400 md:max-w-2xl relative">
        <div className="overflow-y-auto">
          {props.children}
        </div>
        {/* Blue bar */}
        <div className="bg-sky-500 absolute bottom-0 left-0 w-full h-12 flex items-center justify-between px-4 text-white">
          <div>Tweeter.com</div>
          <div>
            <SignOutButton />
          </div>
        </div>
      </div>
    </main>
  );
};

  
      
  
  