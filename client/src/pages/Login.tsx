import React from "react";
import { withMainlayout } from "../layouts";
import { LoginView } from "../components/Views";

export const LoginPage: React.FC = withMainlayout(() => {
  return <LoginView />
});
