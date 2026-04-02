import { createHash } from "node:crypto";

import { validateMacAddress } from "./password.js";

const UPPERCASE_CHARACTERS = "ACDFGHJMNPRSTUWXY";
const LOWERCASE_CHARACTERS = "abcdfghjkmpstuwxy";
const DIGIT_CHARACTERS = "2345679";
const SPECIAL_CHARACTERS = "!@$&%";

export function generateAdminPassword(macAddress) {
  const normalizedMacAddress = macAddress.toUpperCase();
  const hash = createHash("md5")
    .update(`${normalizedMacAddress}AEJLY`)
    .digest("hex");

  const values = Array.from(hash.slice(0, 20), (character) =>
    Number.parseInt(character, 16),
  );

  const password = Array.from({ length: 16 }, (_, index) => {
    const value = values[index];
    const selection = value % 4;

    if (selection === 0) {
      return UPPERCASE_CHARACTERS[(value * 2) % 17];
    }

    if (selection === 1) {
      return LOWERCASE_CHARACTERS[((value * 2) + 1) % 17];
    }

    if (selection === 2) {
      return DIGIT_CHARACTERS[6 - (value % 7)];
    }

    return SPECIAL_CHARACTERS[4 - (value % 5)];
  });

  const positions = [
    (values[16] + 1) % 16,
    (values[17] + 1) % 16,
    (values[18] + 1) % 16,
    (values[19] + 1) % 16,
  ];

  for (let index = 0; index < positions.length; index += 1) {
    let hasCollision = true;

    while (hasCollision) {
      hasCollision = false;

      for (let priorIndex = 0; priorIndex < index; priorIndex += 1) {
        if (positions[index] === positions[priorIndex]) {
          positions[index] = (positions[index] + 1) % 16;
          hasCollision = true;
        }
      }
    }
  }

  password[positions[0]] = UPPERCASE_CHARACTERS[(values[16] * 2) % 17];
  password[positions[1]] = LOWERCASE_CHARACTERS[((values[17] * 2) + 1) % 17];
  password[positions[2]] = DIGIT_CHARACTERS[6 - (values[18] % 7)];
  password[positions[3]] = SPECIAL_CHARACTERS[4 - (values[19] % 5)];

  return password.join("");
}

export function getClientIpAddress(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const [clientIp] = forwardedFor.split(",");
    if (clientIp) {
      return clientIp.trim();
    }
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  const forwarded = request.headers.get("forwarded");
  if (forwarded) {
    const match = forwarded.match(/for="?([^;,\"]+)"?/i);
    if (match?.[1]) {
      return match[1];
    }
  }

  return "unknown";
}

export function jsonResponse(payload, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  return new Response(JSON.stringify(payload), {
    ...init,
    headers,
  });
}

export function methodNotAllowedResponse(allowedMethod) {
  return jsonResponse(
    {
      success: false,
      error: "Method not allowed",
    },
    {
      status: 405,
      headers: {
        Allow: allowedMethod,
      },
    },
  );
}

export function logRequest(request, details) {
  const { pathname, protocol } = new URL(request.url);
  const clientIp = getClientIpAddress(request);
  const protocolLabel = protocol === "https:" ? "HTTPS" : "HTTP";

  console.log(
    `[${request.method}] ${pathname} ${protocolLabel} - Client IP: ${clientIp}${details ? ` - ${details}` : ""}`,
  );
}

export function parseGenerateRequest(requestBody) {
  if (
    !requestBody ||
    typeof requestBody !== "object" ||
    typeof requestBody.mac !== "string"
  ) {
    return {
      ok: false,
      response: jsonResponse(
        {
          success: false,
          error: "Invalid request body",
        },
        { status: 400 },
      ),
    };
  }

  if (!validateMacAddress(requestBody.mac)) {
    return {
      ok: false,
      response: jsonResponse(
        {
          success: false,
          error: "Invalid MAC address format. Expected format: AA:BB:CC:DD:EE:FF",
        },
        { status: 400 },
      ),
    };
  }

  return {
    ok: true,
    macAddress: requestBody.mac,
  };
}
