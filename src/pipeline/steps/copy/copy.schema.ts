import { z } from "zod";

export const CopySchema = z.object({
  title: z.string(),
  hook: z.string().describe("A frase inicial para prender a atenção"),
  body: z.string().describe("O conteúdo principal do post"),
  cta: z.string().describe("Chamada para ação"),
  hashtags: z.array(z.string()).max(5)
});

export type GeneratedCopy = z.infer<typeof CopySchema>;