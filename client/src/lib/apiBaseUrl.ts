export default function getApiBaseUrl(): string {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    if (!apiBaseUrl) {
        throw new Error("Missing required configuration: VITE_API_BASE_URL");
    }
    return apiBaseUrl.replace(/\/$/, "");
}