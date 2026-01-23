package main

import (
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"os"
	"regexp"
	"strings"
)

// generateAdminPass generates an admin password from a MAC address
// This replicates the algorithm from the Java MainActivity
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

func main() {
	// Check if MAC addresses were provided as arguments
	if len(os.Args) < 2 {
		fmt.Println("Usage: admin_pass <MAC1> [MAC2] [MAC3] ...")
		fmt.Println("Example: admin_pass AA:BB:CC:DD:EE:FF 11:22:33:44:55:66")
		os.Exit(1)
	}

	// Process each MAC address from arguments
	for i, mac := range os.Args[1:] {
		// Validate MAC address format
		if !isValidMAC(mac) {
			fmt.Printf("[%d] MAC: %s - INVALID FORMAT\n", i+1, mac)
			continue
		}

		// Generate and display password
		password := generateAdminPass(mac)
		fmt.Printf("[%d] MAC: %s\n    Password: %s\n\n", i+1, mac, password)
	}
}
