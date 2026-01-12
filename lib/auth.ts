export const setAuthSession = (token: string, user: any, remember: boolean) => {
    if (remember) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
    } else {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    }
};

export const getAuthToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token") || sessionStorage.getItem("token");
};

export const getAuthUser = (): any | null => {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    try {
        return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
        return null;
    }
};

export const clearAuthSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
};
