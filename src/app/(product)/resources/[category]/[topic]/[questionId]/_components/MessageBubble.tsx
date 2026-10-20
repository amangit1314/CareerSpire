import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { dmSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export enum MessageRole {
  Ai = "ai",
  User = "user",
}

export interface Message {
  role: MessageRole;
  content: string;
}

export function MessageBubble({ msg }: { msg: Message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3 sm:gap-4",
        msg.role === MessageRole.User ? "flex-row-reverse" : "",
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
          msg.role === MessageRole.Ai
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground",
        )}
      >
        {msg.role === MessageRole.Ai ? (
          <Bot className="h-4 w-4" />
        ) : (
          <User className="h-4 w-4" />
        )}
      </div>
      <div
        className={cn(
          "max-w-[85%] sm:max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
          msg.role === MessageRole.Ai
            ? "bg-card border border-primary/10 rounded-tl-none"
            : "bg-primary text-white rounded-tr-none",
        )}
      >
        <ReactMarkdown
          components={{
            h1: ({ ...props }) => (
              <h3
                className={cn(
                  dmSans.className,
                  "text-base font-bold mt-4 mb-2 first:mt-0",
                )}
                {...props}
              />
            ),
            h2: ({ ...props }) => (
              <h3
                className={cn(
                  dmSans.className,
                  "text-base font-bold mt-4 mb-2 first:mt-0",
                )}
                {...props}
              />
            ),
            h3: ({ ...props }) => (
              <h4
                className={cn(
                  dmSans.className,
                  "text-sm font-bold mt-3 mb-1.5 first:mt-0",
                )}
                {...props}
              />
            ),
            h4: ({ ...props }) => (
              <h5
                className={cn(
                  dmSans.className,
                  "text-sm font-semibold mt-3 mb-1.5 first:mt-0",
                )}
                {...props}
              />
            ),
            p: ({ ...props }) => <p className="mb-2.5 last:mb-0" {...props} />,
            ul: ({ ...props }) => (
              <ul className="list-disc pl-5 space-y-1 my-2" {...props} />
            ),
            ol: ({ ...props }) => (
              <ol className="list-decimal pl-5 space-y-1 my-2" {...props} />
            ),
            li: ({ ...props }) => <li className="leading-relaxed" {...props} />,
            strong: ({ ...props }) => (
              <strong className="font-semibold text-foreground" {...props} />
            ),
            code: ({ ...props }) => (
              <code
                className={cn(
                  "px-1.5 py-0.5 rounded font-mono text-[0.75rem]",
                  msg.role === MessageRole.Ai
                    ? "bg-primary/10 text-primary"
                    : "bg-white/15 text-white",
                )}
                {...props}
              />
            ),
            pre: ({ ...props }) => (
              <pre
                className={cn(
                  "p-3 rounded-lg overflow-x-auto my-2 text-[0.75rem] font-mono",
                  msg.role === MessageRole.Ai
                    ? "bg-muted/60 border border-border/60"
                    : "bg-white/10 border border-white/20",
                )}
                {...props}
              />
            ),
            blockquote: ({ ...props }) => (
              <blockquote
                className="border-l-2 border-primary/40 pl-3 my-2 italic text-muted-foreground"
                {...props}
              />
            ),
          }}
        >
          {msg.content}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
}
