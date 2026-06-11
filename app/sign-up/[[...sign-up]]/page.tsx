import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8faff' }}>
      <SignUp
        forceRedirectUrl="/loading-workspace"
        signInForceRedirectUrl="/loading-workspace"
      />
    </main>
  );
}
