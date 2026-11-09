import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="h-96 w-80 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/50" />
        }
      >
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl rounded-xl",
              headerTitle: "text-zinc-50 font-bold",
              headerSubtitle: "text-zinc-400 text-xs",
              socialButtonsBlockButton:
                "border border-zinc-800 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 text-xs",
              formButtonPrimary:
                "bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs font-semibold",
              formFieldInput:
                "border border-zinc-800 bg-zinc-900 text-zinc-100 focus:border-zinc-500 text-xs",
              footerActionLink: "text-zinc-400 hover:text-zinc-100 text-xs",
            },
          }}
        />
      </Suspense>
    </div>
  );
}
