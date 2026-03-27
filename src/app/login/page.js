import LoginPage from "@/components/login/loginPage.js";

export default function Page() {
  const handleLogin = () => {
  localStorage.setItem("loggedIn", "false"); 
  router.push("/"); 
};
  return (
    <>
      <LoginPage />
    </>
  );
}