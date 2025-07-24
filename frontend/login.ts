import { client } from './client';

const params = new URLSearchParams(location.search);
const redirectTo = params.get("redirect") ?? "/";

document.getElementById("login-form")!.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const email = (form.elements.namedItem("email") as HTMLInputElement).value;
  const password = (form.elements.namedItem("password") as HTMLInputElement).value;

  try {
    const res = await client.auth.login.mutate({ email, password, redirectTo });
    // Cookies set via response; just navigate
    window.location.href = res.redirectTo;
  } catch (err: any) {
    alert(err.message ?? "Login failed");
  }
});
