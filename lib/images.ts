export const IMAGE_BASE_URL = "https://fiwfan-bucket.s3.ap-southeast-1.amazonaws.com/"

export const getImageUrl = (path: string | undefined | null) => {
    if (!path) return "/mock/creators/1.png"; // Default placeholder
    if (path.startsWith("http")) {
        return path.replace("http://api.phusao.com", "https://api.phusao.com");
    }
    return `${IMAGE_BASE_URL}${path}`;
};
