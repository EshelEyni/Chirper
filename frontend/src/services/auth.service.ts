async function login(username: string, password: string): Promise<any> {
  //   const response = await fetch(`${config.apiUrl}/users/authenticate`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ username, password })
  //   });

  //   return handleResponse(response);

  return { username, password };
}

async function logout(): Promise<any> {
  //   const response = await fetch(`${config.apiUrl}/users/logout`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ username, password })
  //   });
  //   return handleResponse(response);
  //   return;
}

export const authService = {
  login,
  logout,
};
