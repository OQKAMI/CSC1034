// TODO: DOCUMENT THIS
export async function executeQuery(params) {
    let url = "https://amakay01.webhosting1.eeecs.qub.ac.uk/dbConnector.php";
    try {
        let response = await fetch(url, {
            method: "POST",
            body: params,
        });

        let result = await response.json();
        
        return result;
    } catch (err) {
        console.error("Error executing query:", err);
    }
}

// TODO: DOCUMENT THIS
export async function backendUsernameAvailability(username) {
    try {
        let params = new URLSearchParams();
        params.append("action", "usernameAvailability");
        params.append("username", username);

        const result = await executeQuery(params);
        if (result && result.available === true) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.error("Error checking username availability:", err);
        return { isAvailable: false, error: "Network error" };
    }
}

// TODO: DOCUMENT THIS
export async function backendUserRegistration(userID, username, hashedPassword) {
    try {
        let params = new URLSearchParams();
        params.append("action", "register");
        params.append("userID", userID);
        params.append("username", username);
        params.append("password", hashedPassword);

        const result = await executeQuery(params);
        if (result && result.success) {
            return { success: true, sessionID: result.sessionID };
        } else {
            return { success: false, error: result.error };
        }
    } catch (err) {
        console.error("Registration error:", err);
        return { success: false, error: "Network error during registering" };
    }
}

// TODO: DOCUMENT THIS
export async function backendUserLogin(username, password) {
    try {
        let params = new URLSearchParams();
        params.append("action", "login");
        params.append("username", username);
        params.append("password", password);

        const result = await executeQuery(params);
        if (result && result.success) {
            return { success: true, sessionID: result.sessionID };
        } else {
            return { success: false, error: result.error || "Invalid username or password" };
        }
    } catch (err) {
        console.error("Login error:", err);
        return { success: false, error: "Network error during login" };
    }
}

// TODO: DOCUMENT THIS
export async function checkSession(sessionID) {
    try {
        let params = new URLSearchParams();
        params.append("action", "checkSession");
        params.append("sessionID", sessionID);

        const result = await executeQuery(params);
        return result?.valid || false;
    } catch (err) {
        console.error("Error checking session:", err);
        return false;
    }
}

// TODO: DOCUMENT THIS
export async function getCurrentUserID(sessionID) {
    try {
        let params = new URLSearchParams();
        params.append("action", "getUserID");
        params.append("sessionID", sessionID);

        const result = await executeQuery(params);

        if (result) {
            return { success: true, userID: result.userID };
        } else {
            return { success: false, error: result.error || "Network error" };
        }
    } catch (err) {
        console.error("Error getting current user ID:", err);
        return { success: false, error: "Network error" };
    }
}

// TODO: DOCUMENT THIS
export async function backendDeleteExpiredSessions() {
    try {
        let params = new URLSearchParams();
        params.append("action", "deleteExpiredSessions");

        const result = await executeQuery(params);
        if (result && result.success) {
            return { success: true };
        } else {
            return { success: false, error: result.error || "Failed to delete expired sessions" };
        }
    } catch (err) {
        console.error("Error deleting expired sessions:", err);
        return { success: false, error: "Network error during session cleanup" };
    }
}

export async function checkWordWithAPI(word) {
    try {
        let params = new URLSearchParams();
        params.append("action", "checkWord");
        params.append("word", word);

        const result = await executeQuery(params);
        if (result && result.valid) {
            return { success: true, data: result.data }; // TODO: REMOVE DATA -> DEBUG ONLY
        } else {
            return { success: false };
        }
    } catch (err) {
        console.error("Error checking word with API:", err);
        return { success: false, error: "Network error during word check" };
    }
}