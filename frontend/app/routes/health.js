import {
  jsonResponse,
  logRequest,
  methodNotAllowedResponse,
} from "../lib/password.server.js";

export function loader({ request }) {
  logRequest(request, "Health check");
  return jsonResponse({ status: "ok" });
}

export function action({ request }) {
  logRequest(request, "Method not allowed");
  return methodNotAllowedResponse("GET");
}
