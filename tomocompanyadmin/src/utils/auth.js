export const isAuthenticated = () => !!localStorage.getItem("token");

export const login = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const logout = () => {
  localStorage.clear();
  window.location.href = "/";
};
