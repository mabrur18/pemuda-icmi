import React from "react";
import { getSiteLogo } from "@/lib/sanity/site-logo";
import { HeaderClient } from "./HeaderClient";

/** Server wrapper: fetches the Sanity logo, then hands it to the client header. */
export async function Header() {
  const logo = await getSiteLogo();
  return <HeaderClient logo={logo} />;
}
