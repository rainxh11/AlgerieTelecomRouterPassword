import "./app.css";

import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "react-router";

export function links() {
  return [
    { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
  ];
}

function Document({ children, title = "Fiberhome Password Generator" }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function Layout({ children }) {
  return <Document>{children}</Document>;
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();

  let title = "Application Error";
  let message = "Something went wrong while rendering this page.";

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message =
      typeof error.data === "string"
        ? error.data
        : "The requested page could not be rendered.";
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <Document title={title}>
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-lg rounded-lg border border-red-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="mt-3 text-sm text-gray-600">{message}</p>
        </div>
      </div>
    </Document>
  );
}
