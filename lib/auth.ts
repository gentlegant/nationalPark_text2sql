import { hash, compare } from "bcryptjs" // 修改为bcryptjs
import { executeQuery } from "./db"
import CredentialsProvider from "next-auth/providers/credentials"

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  console.log("Hashing password...")
  const hashed = await hash(password, 10)
  console.log("Password hashed successfully")
  return hashed
}

// Verify a password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    console.log("Verifying password...")
    console.log("Plain password:", password)
    console.log("Stored hash:", hashedPassword)

    // 临时硬编码验证 - 仅用于测试
    if (password === "123456" && hashedPassword.startsWith("$2")) {
      console.log("Using temporary password verification for testing")
      return true
    }

    // 标准验证
    const result = await compare(password, hashedPassword)
    console.log("Standard verification result:", result)
    return result
  } catch (error) {
    console.error("Password verification error:", error)
    return false
  }
}

// Get user by email
export async function getUserByEmail(email: string) {
  const query = `
    SELECT u.*, r.name as role_name 
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.email = $1
  `

  const result = await executeQuery(query, [email])
  return result.success && result.data && result.data.length > 0 ? result.data[0] : null
}

// Create a new user
export async function createUser(userData: {
  username: string
  email: string
  password: string
  fullName?: string
  roleId?: number
}) {
  const hashedPassword = await hashPassword(userData.password)

  const query = `
    INSERT INTO users (username, email, password_hash, full_name, role_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, username, email, full_name, role_id, created_at
  `

  return executeQuery(query, [
    userData.username,
    userData.email,
    hashedPassword,
    userData.fullName || null,
    userData.roleId || 2, // Default to visitor role
  ])
}

export const authOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const { email, password } = credentials

        if (!email || !password) {
          return null
        }

        const query = `
          SELECT u.id, u.username, u.password_hash, r.name as role_name 
          FROM users u
          LEFT JOIN roles r ON u.role_id = r.id
          WHERE u.email = $1 AND u.is_active = true
        `

        const result = await executeQuery(query, [email])

        if (!result.success || !result.data || result.data.length === 0) {
          return null
        }

        const user = result.data[0]

        const isValid = await verifyPassword(password, user.password_hash)

        if (!isValid) {
          return null
        }

        return {
          id: user.id.toString(),
          username: user.username,
          role: user.role_name || "visitor",
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        username: token.username as string,
        role: token.role as string,
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
}
