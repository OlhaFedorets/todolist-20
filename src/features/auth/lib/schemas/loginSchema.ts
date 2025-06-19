import { z } from "zod"

// export const loginSchema = z.object({
//   email: z.string().min(1, { message: "Email is required" }).email({ message: "Incorrect email address" }),
//   password: z
//     .string()
//     .min(1, { message: "Password is required" })
//     .min(3, { message: "Password must be at least 3 characters long" }),
//   rememberMe: z.boolean(),
//   captcha: z.string().optional()
// })

const baseSchema = z.object({
  email: z.string().min(1, { message: "Email is required" }).email({ message: "Incorrect email address" }),
  password: z
      .string()
      .min(1, { message: "Password is required" })
      .min(3, { message: "Password must be at least 3 characters long" }),
  rememberMe: z.boolean(),
})

export const loginSchema = baseSchema.extend({
  captcha: z.string().optional()
})

export const loginWithCaptchaSchema = baseSchema.extend({
  captcha: z.string().min(1, { message: "Captcha is required" })
})

export type Inputs = z.infer<typeof loginSchema>
