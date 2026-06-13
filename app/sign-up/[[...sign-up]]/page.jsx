import { SignUp } from "@clerk/nextjs";

export const metadata = {
  title: "Create Account",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignUpPage() {
  return (
    <main style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8faff' }}>
      <SignUp
        fallbackRedirectUrl="/loading-workspace"
        signInFallbackRedirectUrl="/loading-workspace"
      />
    </main>
  );
}
