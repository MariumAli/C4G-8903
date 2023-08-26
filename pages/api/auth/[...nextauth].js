import NextAuth from "next-auth"
import GoogleProvider from 'next-auth/providers/google'

export default NextAuth({
    providers: [
        GoogleProvider({
            clientId: "537650012750-6sqv9he1jge676e9l3darmcbeb5fndi0.apps.googleusercontent.com",
            clientSecret: "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",
            authorization: {
              params: {
                prompt: "consent",
                access_type: "offline",
                response_type: "code"
              }
            }
          })
    ],
    secret: "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"
});
