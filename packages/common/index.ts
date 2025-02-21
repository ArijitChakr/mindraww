import z from "zod";

export const SignupSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  password: z.string(),
});

export const SigninSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const RoomSchema = z.object({
  slug: z.string(),
});

export const ChatSchema = z.object({
  message: z.string(),
});
