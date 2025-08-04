async function executeQuery(params) {
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

export async function backendCheckWordWithAPI(word) {
    const cleanWord = word.toLowerCase();
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`;

    try {
        const response = await fetch(url);
        
        if (response.ok) {
            return { valid: true };
        } else if (response.status === 404) {
            return { valid: false, error: 'Word not found in dictionary' };
        } else {
            return { valid: false, error: `HTTP Error: ${response.status}` };
        }
    } catch (error) {
        return { valid: false, error: `Network error: ${error.message}` };
    }
}

export async function backendSaveWord(gameID, word) {
    try {
        let params = new URLSearchParams();
        params.append("action", "saveWord");
        params.append("gameID", gameID);
        params.append("word", word);

        const result = await executeQuery(params);
        if (result && result.success) {
            return { success: true };
        } else {
            return { success: false, error: result.error || "Failed to save word" };
        }
    } catch (err) {
        console.error("Error saving word:", err);
        return { success: false, error: "Network error during word save" };
    }
}

export async function backendCheckExistingGame() {
    const userID = await getCurrentUserID(localStorage.getItem("sessionID"));
    if (!userID.success) {
        console.error("Failed to get current user ID:", userID.error);
        return { success: false, error: "Failed to get current user ID" };
    }

    try {
        let params = new URLSearchParams();
        params.append("action", "checkExistingGame");
        params.append("userID", userID.userID);

        const result = await executeQuery(params);
        if (result && result.hasGameSave) {
            return { success: true, hasGameSave: result.hasGameSave, gameData: result.gameData || null };
        } else {
            return { success: false, error: result.error || "No existing game found" };
        }
    } catch (err) {
        console.error("Error checking existing game:", err);
        return { success: false, error: "Network error during game check" };
    }
}

export async function backendCreateGame(userID, difficulty) {
    try {
        let params = new URLSearchParams();
        params.append("action", "createGame");
        params.append("userID", userID);
        params.append("difficulty", difficulty);

        const result = await executeQuery(params);
        if (result && result.success) {
            return { success: true, gameID: result.gameID };
        } else {
            return { success: false, error: result.error || "Failed to create game" };
        }
    } catch (err) {
        console.error("Error creating game:", err);
        return { success: false, error: "Network error during game creation" };
    }
}

export async function backendUpdateScore(gameID, score) {
    try {
        let params = new URLSearchParams();
        params.append("action", "updateGameScore");
        params.append("gameID", gameID);
        params.append("score", score);

        const result = await executeQuery(params);
        if (result && result.success) {
            return { success: true };
        } else {
            return { success: false, error: result.error || "Failed to update score" };
        }
    } catch (err) {
        console.error("Error updating score:", err);
        return { success: false, error: "Network error during score update" };
    }   
}

async function backendFetchHigestScore(userID) {
    try {
        let params = new URLSearchParams();
        params.append("action", "fetchHighestScore");
        params.append("userID", userID);

        const result = await executeQuery(params);
        if (result && result.success) {
            return { success: true, highestScore: result.highestScore };
        } else {
            return { success: false, error: result.error || "Failed to fetch highest score" };
        }
    } catch (err) {
        console.error("Error fetching highest score:", err);
        return { success: false, error: "Network error during highest score fetch" };
    }
}

export async function backendFetchGameScore(gameID) {
    try {
        let params = new URLSearchParams();
        params.append("action", "fetchGameScore");
        params.append("gameID", gameID);

        const result = await executeQuery(params);
        if (result && result.success) {
            return { success: true, score: result.score };
        } else {
            return { success: false, error: result.error || "Failed to fetch game score" };
        }
    } catch (err) {
        console.error("Error fetching game score:", err);
        return { success: false, error: "Network error during game score fetch" };
    }
}

async function backendFetchWordCount(gameID) {
    try {
        let params = new URLSearchParams();
        params.append("action", "fetchWordCount");
        params.append("gameID", gameID);

        const result = await executeQuery(params);
        if (result && result.success) {
            return { success: true, wordCount: result.wordCount };
        } else {
            return { success: false, error: result.error || "Failed to fetch word count" };
        }
    } catch (err) {
        console.error("Error fetching word count:", err);
        return { success: false, error: "Network error during word count fetch" };
    }
}

export async function backendUpdateUserStats(userID, gameID) {
    const gameScoreResult = await backendFetchGameScore(gameID);
    if (!gameScoreResult.success) {
        return { success: false, error: gameScoreResult.error };
    }

    const gameScore = gameScoreResult.score;

    const wordsEnteredResult = await backendFetchWordCount(gameID);
    if (!wordsEnteredResult.success) {
        return { success: false, error: wordsEnteredResult.error };
    }
    const wordsEntered = wordsEnteredResult.wordCount;

    try {
        let params = new URLSearchParams();
        params.append("action", "updateUserStats");
        params.append("userID", userID);
        params.append("score", gameScore);
        params.append("wordsEntered", wordsEntered);

        const result = await executeQuery(params);
        if (result && result.success) {
            return { success: true };
        } else {
            return { success: false, error: result.error || "Failed to update user stats" };
        }
    } catch (err) {
        console.error("Error updating user stats:", err);
        return { success: false, error: "Network error during user stats update" };
    }
}