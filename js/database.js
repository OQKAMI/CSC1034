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

export async function isUsernameAvailable(username) {
    let params = new URLSearchParams();
    params.append("query", `SELECT CASE WHEN COUNT(*) = 0 THEN 'AVAILABLE' ELSE 'UNAVAILABLE' END AS availability FROM Users WHERE username = '${username}';`);

    let result = await executeQuery(params);
    return result.data[0].availability === "AVAILABLE";
}

export async function insertUser(userID, username, hashedPassword) {
    let params = new URLSearchParams();
    params.append("query", `INSERT INTO Users (userID, username, password) VALUES ('${userID}', '${username}', '${hashedPassword}');`);

    return await executeQuery(params);
}

export async function insertSession(sessionID, userID) {
    let params = new URLSearchParams();
    params.append("query", `INSERT INTO Sessions (sessionID, userID) VALUES ('${sessionID}', '${userID}');`);

    return await executeQuery(params);
}

export async function getValidSessionIDs() {
    let params = new URLSearchParams();
    params.append("query", "SELECT sessionID FROM Sessions WHERE expiresAt < CURRENT_TIMESTAMP;");

    let result = await executeQuery(params);
    return result.data.map(row => row.sessionID);
}

export async function deleteExpiredSessions() {
    let params = new URLSearchParams();
    params.append("query", "DELETE FROM Sessions WHERE expiresAt < CURRENT_TIMESTAMP;");

    return await executeQuery(params);
}