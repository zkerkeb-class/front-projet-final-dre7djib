export const decodeJWT = (token) => {
    try {
        // Le token JWT est composé de 3 parties séparées par des points
        const base64Url = token.split('.')[1];
        // Remplacer les caractères spécifiques à base64url par leurs équivalents base64
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        // Décoder la chaîne base64 en JSON
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Erreur lors du décodage du token JWT:', error);
        return null;
    }
}; 