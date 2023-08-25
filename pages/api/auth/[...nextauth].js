import NextAuth from "next-auth"
import GoogleProvider from 'next-auth/providers/google'

export default NextAuth({
    providers: [
        GoogleProvider({
            clientId: "537650012750-6sqv9he1jge676e9l3darmcbeb5fndi0.apps.googleusercontent.com",
            clientSecret: "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",
        })
    ],
    jwt: {
        encryption: true
    },
    secret: "secret token",
    //Callback here
    callbacks: {
        async session({ session, token }) {
            session.user = token.user;
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.user = user;
            }
            return token;
        },
        redirect: async (url, _baseUrl) => {
            if (url === '/user') {
                return Promise.resolve('/')
            }
            return Promise.resolve('/')
        }
    }
});
