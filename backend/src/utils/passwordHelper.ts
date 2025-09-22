// Password hashing helpers. Adjust rounds based on latency and security needs.
import bcrypt from "bcrypt";

// Rounds: 10 is a good baseline for serverless workloads.
// If you keep 12, expect higher latency on cold starts.
export const hashPassword = async (originalPassword: string): Promise<string> => {
  const hashedPassword = await bcrypt.hash(originalPassword, 12);
  return hashedPassword;
};

export const compareHashedPassword = async (
  originalPassword: string,
  dbPassword: string
): Promise<boolean> => {
  const result = await bcrypt.compare(originalPassword, dbPassword);
  return result;
};
