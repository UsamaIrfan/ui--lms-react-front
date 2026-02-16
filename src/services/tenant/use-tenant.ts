"use client";

import { useContext } from "react";
import { TenantContext } from "./tenant-context";

function useTenant() {
  return useContext(TenantContext);
}

export default useTenant;
