/** Max size for logo stored in localStorage (base64 grows ~4/3). */
const MAX_BYTES = 450_000;

export async function readImageFileAsDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("not-image");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("too-large");
  }
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error ?? new Error("read-failed"));
    r.readAsDataURL(file);
  });
}
