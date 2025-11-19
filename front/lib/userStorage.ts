export function getStoredUserId(): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem("authUserProfile");
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as { id?: number | string };
    const id = Number(parsed.id);
    return Number.isFinite(id) ? id : null;
  } catch (error) {
    console.warn("Não foi possível ler o usuário armazenado:", error);
    return null;
  }
}
