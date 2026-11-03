export const saveAuth = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
};

export const getToken = () => localStorage.getItem("token");

export const getUser = () => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
};

export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};

export const isLoggedIn = () => !!getToken();
export const isAdmin = () => getUser()?.role === "admin";