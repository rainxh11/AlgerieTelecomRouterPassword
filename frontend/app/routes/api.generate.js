import {
  generateAdminPassword,
  jsonResponse,
  logRequest,
  methodNotAllowedResponse,
  parseGenerateRequest,
} from "../lib/password.server.js";

export function loader({ request }) {
  logRequest(request, "Method not allowed");
  return methodNotAllowedResponse("POST");
}

export async function action({ request }) {
  if (request.method !== "POST") {
    logRequest(request, "Method not allowed");
    return methodNotAllowedResponse("POST");
  }

  let requestBody;

  try {
    requestBody = await request.json();
  } catch {
    logRequest(request, "Invalid request body");
    return jsonResponse(
      {
        success: false,
        error: "Invalid request body",
      },
      { status: 400 },
    );
  }

  logRequest(
    request,
    `Processing password generation request - Input MAC: '${requestBody?.mac ?? "unknown"}'`,
  );

  const parsedRequest = parseGenerateRequest(requestBody);

  if (!parsedRequest.ok) {
    logRequest(
      request,
      `Rejected password generation request - Input MAC: '${requestBody?.mac ?? "unknown"}'`,
    );
    return parsedRequest.response;
  }

  const password = generateAdminPassword(parsedRequest.macAddress);

  logRequest(
    request,
    `Generated password - Input MAC: '${parsedRequest.macAddress}' - Password: '${password}'`,
  );

  return jsonResponse({
    mac: parsedRequest.macAddress,
    password,
    success: true,
  });
}
