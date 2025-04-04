export const getToken = () =>
  localStorage.getItem('accessToken') ||
  document.cookie
    .split('; ')
    .find((row) => row.startsWith('accessToken'))
    ?.split('=')[1] ||
  '';
