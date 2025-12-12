import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const getStrength = (pass: string): { score: number; label: string; color: string } => {
    let score = 0;
    
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score: 1, label: "Weak", color: "bg-destructive" };
    if (score <= 4) return { score: 2, label: "Fair", color: "bg-yellow-500" };
    if (score <= 5) return { score: 3, label: "Good", color: "bg-primary" };
    return { score: 4, label: "Strong", color: "bg-green-500" };
  };

  if (!password) return null;

  const strength = getStrength(password);

  return (
    <div className="space-y-2 animate-fade-in">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              level <= strength.score ? strength.color : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className={cn(
        "text-xs font-medium",
        strength.score === 1 && "text-destructive",
        strength.score === 2 && "text-yellow-600",
        strength.score === 3 && "text-primary",
        strength.score === 4 && "text-green-600"
      )}>
        Password strength: {strength.label}
      </p>
    </div>
  );
}
