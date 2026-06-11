import { SignIn } from "@clerk/nextjs";

export default function SignupPage() {
  return (
    <div className="auth-page">
      <SignIn />
    </div>
  );
}