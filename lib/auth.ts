import { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { Adapter } from 'next-auth/adapters'
import pool from './db'

// Custom PostgreSQL Adapter for alrimjang schema
function CustomPgAdapter(): Adapter {
  return {
    async createUser(user) {
      const result = await pool.query(
        'INSERT INTO alrimjang.users (id, name, email, "emailVerified", image, created_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING *',
        [crypto.randomUUID(), user.name, user.email, user.emailVerified, user.image]
      )
      return result.rows[0]
    },
    async getUser(id) {
      const result = await pool.query('SELECT * FROM alrimjang.users WHERE id = $1', [id])
      return result.rows[0] || null
    },
    async getUserByEmail(email) {
      const result = await pool.query('SELECT * FROM alrimjang.users WHERE email = $1', [email])
      return result.rows[0] || null
    },
    async getUserByAccount({ providerAccountId, provider }) {
      const result = await pool.query(
        'SELECT u.* FROM alrimjang.users u JOIN alrimjang.accounts a ON u.id = a."userId" WHERE a."providerAccountId" = $1 AND a.provider = $2',
        [providerAccountId, provider]
      )
      return result.rows[0] || null
    },
    async updateUser(user) {
      const result = await pool.query(
        'UPDATE alrimjang.users SET name = $1, email = $2, "emailVerified" = $3, image = $4 WHERE id = $5 RETURNING *',
        [user.name, user.email, user.emailVerified, user.image, user.id]
      )
      return result.rows[0]
    },
    async deleteUser(userId) {
      await pool.query('DELETE FROM alrimjang.users WHERE id = $1', [userId])
    },
    async linkAccount(account) {
      await pool.query(
        'INSERT INTO alrimjang.accounts (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
        [
          crypto.randomUUID(),
          account.userId,
          account.type,
          account.provider,
          account.providerAccountId,
          account.refresh_token,
          account.access_token,
          account.expires_at,
          account.token_type,
          account.scope,
          account.id_token,
          account.session_state,
        ]
      )
      return account
    },
    async unlinkAccount({ providerAccountId, provider }) {
      await pool.query(
        'DELETE FROM alrimjang.accounts WHERE "providerAccountId" = $1 AND provider = $2',
        [providerAccountId, provider]
      )
    },
    async createSession(session) {
      await pool.query(
        'INSERT INTO alrimjang.sessions (id, "sessionToken", "userId", expires) VALUES ($1, $2, $3, $4)',
        [crypto.randomUUID(), session.sessionToken, session.userId, session.expires]
      )
      return session
    },
    async getSessionAndUser(sessionToken) {
      const result = await pool.query(
        'SELECT s.*, u.* FROM alrimjang.sessions s JOIN alrimjang.users u ON s."userId" = u.id WHERE s."sessionToken" = $1',
        [sessionToken]
      )
      if (!result.rows[0]) return null
      const { id: sessionId, sessionToken: token, userId, expires, ...user } = result.rows[0]
      return {
        session: { sessionToken: token, userId, expires },
        user: { id: userId, ...user },
      }
    },
    async updateSession(session) {
      const result = await pool.query(
        'UPDATE alrimjang.sessions SET expires = $1 WHERE "sessionToken" = $2 RETURNING *',
        [session.expires, session.sessionToken]
      )
      return result.rows[0]
    },
    async deleteSession(sessionToken) {
      await pool.query('DELETE FROM alrimjang.sessions WHERE "sessionToken" = $1', [sessionToken])
    },
    async createVerificationToken(token) {
      await pool.query(
        'INSERT INTO alrimjang.verification_tokens (identifier, token, expires) VALUES ($1, $2, $3)',
        [token.identifier, token.token, token.expires]
      )
      return token
    },
    async useVerificationToken({ identifier, token }) {
      const result = await pool.query(
        'DELETE FROM alrimjang.verification_tokens WHERE identifier = $1 AND token = $2 RETURNING *',
        [identifier, token]
      )
      return result.rows[0] || null
    },
  }
}

export const authOptions: AuthOptions = {
  adapter: CustomPgAdapter(),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
