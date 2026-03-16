import { useNavigate } from "react-router-dom";
import { useDemoRoleStore } from "@/features/demo/useDemoRoleStore";

export function useCompanySession() {
  const navigate = useNavigate();
  const resetCompanySession = useDemoRoleStore((s) => s.resetCompanySession);

  const clearCompanySession = () => {
    resetCompanySession();
  };

  const exitToSelector = () => {
    clearCompanySession();
    navigate("/", { replace: true });
  };

  return {
    clearCompanySession,
    exitToSelector,
  };
}
