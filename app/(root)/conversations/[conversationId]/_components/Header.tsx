import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CircleArrowLeft, MoreVertical } from "lucide-react";
import Link from "next/link";
import React from "react";

type Option = {
  label: string;
  destructive?: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
};

type Props = {
  imageUrl?: string;
  name: string;
  description?: string;
  options?: Option[];
  showBackButton?: boolean;
  backHref?: string;
  variant?: "default" | "minimal";
  children?: React.ReactNode;
};

const Header = ({
  imageUrl,
  name,
  description,
  options,
  showBackButton = true,
  backHref = "/conversations",
  variant = "default",
  children,
}: Props) => {
  const destructiveOptions = options?.filter((opt) => opt.destructive) || [];
  const nonDestructiveOptions =
    options?.filter((opt) => !opt.destructive) || [];

  return (
    <Card
      className={cn(
        "w-full flex rounded-lg items-center p-3 justify-between flex-row",
        variant === "minimal" &&
          "shadow-none border-x-0 border-t-0 rounded-none"
      )}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Back Button */}
        {showBackButton && (
          <Link href={backHref} className="flex-shrink-0">
            <CircleArrowLeft className="h-5 w-5" />
          </Link>
        )}

        {/* Avatar */}
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={imageUrl} />
          <AvatarFallback className="text-sm font-medium">
            {name.substring(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Name and Description */}
        <div className="flex flex-col min-w-0 flex-1">
          <h2 className="font-semibold text-base truncate">{name}</h2>
          {description && (
            <p className="text-sm text-muted-foreground truncate">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Additional Content */}
      {children && (
        <div className="flex items-center gap-2 mx-4">{children}</div>
      )}

      {/* Options Menu */}
      {options && options.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="flex-shrink-0 hover:bg-muted"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {/* Non-destructive options */}
            {nonDestructiveOptions.map((option, id) => (
              <DropdownMenuItem
                key={id}
                onClick={option.onClick}
                className={cn("flex items-center gap-2 font-medium", {
                  "text-destructive": option.destructive,
                })}
              >
                {option.icon}
                {option.label}
              </DropdownMenuItem>
            ))}

            {/* Separator if both types exist */}
            {nonDestructiveOptions.length > 0 &&
              destructiveOptions.length > 0 && <DropdownMenuSeparator />}

            {/* Destructive options */}
            {destructiveOptions.map((option, id) => (
              <DropdownMenuItem
                key={`destructive-${id}`}
                onClick={option.onClick}
                className={cn(
                  "flex items-center gap-2 font-medium text-destructive focus:text-destructive",
                  "focus:bg-destructive/10"
                )}
              >
                {option.icon}
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </Card>
  );
};

export default Header;
