// Centralized place to attach the Bearer token to axios calls that need auth.
export const useConfig = () => {
  const token = localStorage.getItem("token");
  const configWithJWT = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return { configWithJWT };
};
