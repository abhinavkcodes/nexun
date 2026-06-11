import { SignUp } from "@clerk/nextjs";

export default function SignupPage() {
  return (
    <div className="auth-page">
      <SignUp />
    </div>
  );
}