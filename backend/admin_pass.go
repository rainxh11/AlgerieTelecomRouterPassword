// Algérie Télécom's Fiberhome HG6145F1 Password Generator - REST API
//
// Credits: Password generation algorithm by @theeyepatch07
// Original source: https://github.com/theeyepatch07/HG6145F1_PasswordGen
//
// This implementation decompiled the original APK, extracted the algorithm,
// converted it to Go, and created a REST API backend with web frontend.
//
// Source code: https://github.com/rainxh11/AlgerieTelecomRouterPassword
// Community: https://t.me/FTTHALGERIAGROUP

package main

import (
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"regexp"
	"strings"
)

// generateAdminPass generates an admin password from a MAC address
// Algorithm by @theeyepatch07 (decompiled from original Java MainActivity)
func generateAdminPass(mac string) string {
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("Error generating password:", r)
		}
	}()

	// Convert MAC to uppercase
	mac = strings.ToUpper(mac)

	// Compute MD5 hash of MAC + "AEJLY"
	hash := md5.Sum([]byte(mac + "AEJLY"))
	hexStr := hex.EncodeToString(hash[:])

	// Extract first 20 hex digits as integers
	vals := make([]int, 20)
	for i := 0; i < 20; i++ {
		// Convert hex character to integer (0-15)
		if hexStr[i] >= '0' && hexStr[i] <= '9' {
			vals[i] = int(hexStr[i] - '0')
		} else if hexStr[i] >= 'a' && hexStr[i] <= 'f' {
			vals[i] = int(hexStr[i] - 'a' + 10)
		}
	}

	// Character sets for password generation
	upperChars := "ACDFGHJMNPRSTUWXY"
	lowerChars := "abcdfghjkmpstuwxy"
	digitChars := "2345679"
	specialChars := "!@$&%"

	// Generate initial 16-character password
	password := make([]rune, 16)
	for i := 0; i < 16; i++ {
		v := vals[i]
		sel := v % 4

		switch sel {
		case 0:
			password[i] = rune(upperChars[(v*2)%17])
		case 1:
			password[i] = rune(lowerChars[((v*2)+1)%17])
		case 2:
			password[i] = rune(digitChars[6-(v%7)])
		case 3:
			password[i] = rune(specialChars[4-(v%5)])
		}
	}

	// Calculate positions for character replacement
	positions := []int{
		(vals[16] + 1) % 16,
		(vals[17] + 1) % 16,
		(vals[18] + 1) % 16,
		(vals[19] + 1) % 16,
	}

	// Resolve position collisions
	for i := 0; i < 4; i++ {
		for {
			collision := false
			for j := 0; j < i; j++ {
				if positions[i] == positions[j] {
					positions[i] = (positions[i] + 1) % 16
					collision = true
				}
			}
			if !collision {
				break
			}
		}
	}

	// Replace characters at specific positions
	password[positions[0]] = rune(upperChars[(vals[16]*2)%17])
	password[positions[1]] = rune(lowerChars[((vals[17]*2)+1)%17])
	password[positions[2]] = rune(digitChars[6-(vals[18]%7)])
	password[positions[3]] = rune(specialChars[4-(vals[19]%5)])

	return string(password)
}

// isValidMAC validates MAC address format
func isValidMAC(mac string) bool {
	pattern := `^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$`
	matched, _ := regexp.MatchString(pattern, mac)
	return matched
}

// getClientIP extracts the real client IP from request headers
// Handles reverse proxy headers (X-Forwarded-For, X-Real-IP)
func getClientIP(r *http.Request) string {
	// Check X-Forwarded-For header (set by reverse proxies)
	xForwardedFor := r.Header.Get("X-Forwarded-For")
	if xForwardedFor != "" {
		// X-Forwarded-For can contain multiple IPs (client, proxy1, proxy2, ...)
		// The first one is the original client IP
		ips := strings.Split(xForwardedFor, ",")
		if len(ips) > 0 {
			clientIP := strings.TrimSpace(ips[0])
			return clientIP
		}
	}

	// Check X-Real-IP header (alternative header used by some proxies)
	xRealIP := r.Header.Get("X-Real-IP")
	if xRealIP != "" {
		return xRealIP
	}

	// Fallback to RemoteAddr (direct connection)
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return ip
}

// Request and Response types
type GenerateRequest struct {
	MAC string `json:"mac"`
}

type GenerateResponse struct {
	MAC      string `json:"mac"`
	Password string `json:"password"`
	Success  bool   `json:"success"`
	Error    string `json:"error,omitempty"`
}

// CORS middleware
func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

// generateHandler handles password generation requests
func generateHandler(w http.ResponseWriter, r *http.Request) {
	clientIP := getClientIP(r)
	log.Printf("[%s] %s %s - Client IP: %s", r.Method, r.URL.Path, r.Proto, clientIP)

	w.Header().Set("Content-Type", "application/json")

	if r.Method != "POST" {
		log.Printf("[%s] %s - Method not allowed from %s", r.Method, r.URL.Path, clientIP)
		json.NewEncoder(w).Encode(GenerateResponse{
			Success: false,
			Error:   "Method not allowed",
		})
		return
	}

	var req GenerateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[%s] %s - Invalid request body from %s: %v", r.Method, r.URL.Path, clientIP, err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(GenerateResponse{
			Success: false,
			Error:   "Invalid request body",
		})
		return
	}

	// Validate MAC address format
	if !isValidMAC(req.MAC) {
		log.Printf("[%s] %s - Invalid MAC address '%s' from %s", r.Method, r.URL.Path, req.MAC, clientIP)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(GenerateResponse{
			Success: false,
			Error:   "Invalid MAC address format. Expected format: AA:BB:CC:DD:EE:FF",
		})
		return
	}

	// Generate password
	log.Printf("[%s] %s - Generating password for MAC '%s' from %s", r.Method, r.URL.Path, req.MAC, clientIP)
	password := generateAdminPass(req.MAC)

	log.Printf("[%s] %s - Successfully generated password for MAC '%s' from %s", r.Method, r.URL.Path, req.MAC, clientIP)
	json.NewEncoder(w).Encode(GenerateResponse{
		MAC:      req.MAC,
		Password: password,
		Success:  true,
	})
}

// healthHandler for health checks
func healthHandler(w http.ResponseWriter, r *http.Request) {
	clientIP := getClientIP(r)
	log.Printf("[%s] %s %s - Health check from %s", r.Method, r.URL.Path, r.Proto, clientIP)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	http.HandleFunc("/api/generate", enableCORS(generateHandler))
	http.HandleFunc("/health", healthHandler)

	log.Printf("Server starting on port %s...\n", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}
