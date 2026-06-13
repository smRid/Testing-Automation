import { SignIn } from "@clerk/nextjs";

export const metadata = {
  title: "Sign In",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignInPage() {
  return (
    <main style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8faff' }}>
      <SignIn
        fallbackRedirectUrl="/loading-workspace"
        signUpFallbackRedirectUrl="/loading-workspace"
      />
    </main>
  );
}
