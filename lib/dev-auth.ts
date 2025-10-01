// 개발 환경 인증 우회 설정
import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const devAuthOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Development',
      credentials: {},
      async authorize() {
        // 개발 환경에서만 자동 로그인
        return {
          id: 'dev-user-hasjin',
          email: 'hasjin9@gmail.com',
          name: '개발자',
          image: null,
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || 'dev-user-hasjin'
        session.user.email = 'hasjin9@gmail.com'
        session.user.name = '개발자'
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
