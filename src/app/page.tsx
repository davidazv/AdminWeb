/**
 * Home/Root Page - Redirect to login or dashboard
 */

import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");
}
