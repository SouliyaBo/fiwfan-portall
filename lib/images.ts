export const IMAGE_BASE_URL = "https://fiwfan-bucket.s3.ap-southeast-1.amazonaws.com/"

export const getImageUrl = (path: string | undefined | null) => {
    if (!path) return "/mock/creators/1.png"; // Default placeholder
    if (path.startsWith("http")) return path; // Already a full URL (legacy or external)
    return `${IMAGE_BASE_URL}${path}`;
};
