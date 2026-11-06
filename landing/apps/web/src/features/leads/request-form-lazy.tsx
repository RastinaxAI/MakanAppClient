"use client";

import dynamic from "next/dynamic";

// Keep form code out of pages whose CMS widgets do not render a form.
export const RequestForm = dynamic(() =>
  import("./request-form").then((module) => module.RequestForm),
);
