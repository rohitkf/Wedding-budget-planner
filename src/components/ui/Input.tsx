import clsx from "clsx";

export function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={clsx("mb-1 block text-xs font-medium text-foreground/70", className)} {...props}>
      {children}
    </label>
  );
}

export const inputClasses =
  "w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-400 placeholder:text-foreground/40";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx(inputClasses, className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={clsx(inputClasses, "resize-none", className)} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={clsx(inputClasses, className)} {...props}>
      {children}
    </select>
  );
}

export function FieldError({ children }: { children?: string | null }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-red-500">{children}</p>;
}
