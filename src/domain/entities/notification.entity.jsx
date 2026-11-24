export const NOTICE_TYPES = {
  INFO: "info",
  WARNING: "warning",
};

export function createNotice(message, type = NOTICE_TYPES.INFO) {
  return {
    id: Math.random().toString(36).substring(2, 9),
    message,
    type,
  };
}
