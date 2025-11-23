import bcrypt from "bcrypt";

// Hashes a password string
export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// Compares a plain text password with a hash
export const comparePassword = async (
    plain: string,
    hash: string
): Promise<boolean> => {
    return await bcrypt.compare(plain, hash);
};
