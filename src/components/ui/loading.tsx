import { Loader2 } from "lucide-react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  text?: string;
  className?: string;
  containerClassName?: string;
}

export function Loading({ 
  size = "md", 
  fullScreen = false, 
  text, 
  className = "",
  containerClassName = ""
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  const LoadingContent = () => (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center ${containerClassName}`}>
        <LoadingContent />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center p-4 ${containerClassName}`}>
      <LoadingContent />
    </div>
  );
} 