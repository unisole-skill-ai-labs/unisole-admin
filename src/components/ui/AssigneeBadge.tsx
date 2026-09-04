import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { User, Crown, ChevronDown, Search, X, Check, Shield } from "lucide-react";
import { cn } from "../../lib/utils";

export interface TeamMemberOption {
  id: string;
  name?: string;
  phone?: string;
  role?: string;
  departmentId?: string;
  activeTasksCount?: number;
}

export interface AssigneeBadgeProps {
  user?: {
    id?: string;
    name?: string;
    phone?: string;
    role?: string;
  } | null;
  userId?: string | null;
  userName?: string | null;
  userRole?: string | null;
  teamMembers?: TeamMemberOption[];
  onSelect?: (memberId: string | null) => void;
  label?: string;
  placeholder?: string;
  variant?: "owner" | "lead" | "assignee";
  size?: "xs" | "sm" | "md";
  disabled?: boolean;
  className?: string;
}

const AVATAR_GRADIENTS = [
  "from-indigo-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-purple-500 to-indigo-600",
];

function getAvatarColor(nameOrId: string = ""): string {
  let hash = 0;
  for (let i = 0; i < nameOrId.length; i++) {
    hash = nameOrId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}

export const AssigneeBadge: React.FC<AssigneeBadgeProps> = ({
  user,
  userId,
  userName,
  userRole,
  teamMembers = [],
  onSelect,
  label,
  placeholder = "+ Assign",
  variant = "assignee",
  size = "xs",
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [popoverCoords, setPopoverCoords] = useState<{
    top: number;
    left: number;
    placement: "top" | "bottom";
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Derive resolved user properties
  const currentId = user?.id || userId;
  const currentName = user?.name || userName || (user?.phone ? user.phone : null);
  const currentRole = user?.role || userRole;

  // If team members are provided and currentId is known, try finding more details
  const matchedMember = teamMembers.find((m) => m.id === currentId);
  const displayName = currentName || matchedMember?.name || matchedMember?.phone || null;
  const displayRole = currentRole || matchedMember?.role || null;

  const isEditable = !disabled && Boolean(onSelect);

  // Calculate coordinates to break out of all overflow:hidden boundaries via Portal
  const updatePosition = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const popoverWidth = 280;
    const popoverEstimatedHeight = 280;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const placement: "top" | "bottom" =
      spaceBelow < popoverEstimatedHeight && spaceAbove > spaceBelow ? "top" : "bottom";

    let top = placement === "bottom" ? rect.bottom + 6 : rect.top - popoverEstimatedHeight - 6;
    if (top < 10) top = 10;
    if (top + popoverEstimatedHeight > window.innerHeight - 10) {
      top = Math.max(10, window.innerHeight - popoverEstimatedHeight - 10);
    }

    let left = rect.left;
    if (left + popoverWidth > window.innerWidth - 16) {
      left = window.innerWidth - popoverWidth - 16;
    }
    if (left < 16) left = 16;

    setPopoverCoords({ top, left, placement });
  };

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    const handleReposition = () => updatePosition();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const filteredMembers = teamMembers.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.phone && m.phone.toLowerCase().includes(q)) ||
      (m.role && m.role.toLowerCase().includes(q))
    );
  });

  const handleChoose = (id: string | null) => {
    if (onSelect) {
      onSelect(id);
    }
    setIsOpen(false);
  };

  const initial = displayName ? displayName.charAt(0).toUpperCase() : "?";
  const avatarGradient = getAvatarColor(currentId || displayName || "u");

  const IconComponent = variant === "owner" ? Crown : variant === "lead" ? Shield : User;

  return (
    <div className={cn("relative inline-block select-none", className)} ref={containerRef}>
      {/* Badge Button / Display */}
      <button
        type="button"
        disabled={!isEditable}
        onClick={(e) => {
          e.stopPropagation();
          if (isEditable) setIsOpen(!isOpen);
        }}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg font-medium transition-all text-left",
          isEditable
            ? "cursor-pointer hover:ring-2 hover:ring-indigo-500/30 hover:border-indigo-400"
            : "cursor-default",
          size === "xs" && "px-2 py-0.5 text-[10px]",
          size === "sm" && "px-2.5 py-1 text-xs",
          size === "md" && "px-3 py-1.5 text-xs font-semibold",
          displayName
            ? "bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs"
            : "bg-zinc-50 dark:bg-zinc-900/50 text-zinc-400 dark:text-zinc-500 border border-dashed border-zinc-200 dark:border-zinc-800 hover:text-indigo-600 hover:border-indigo-400"
        )}
        title={isEditable ? `Click to reassign ${variant}` : `${variant}: ${displayName || "Unassigned"}`}
      >
        {displayName ? (
          <>
            <div
              className={cn(
                "rounded-full text-white flex items-center justify-center font-black shadow-2xs bg-gradient-to-tr shrink-0",
                avatarGradient,
                size === "xs" && "w-4 h-4 text-[8px]",
                size === "sm" && "w-5 h-5 text-[9px]",
                size === "md" && "w-6 h-6 text-[10px]"
              )}
            >
              {initial}
            </div>

            <div className="flex items-center gap-1 min-w-0">
              {label && (
                <span className="text-zinc-400 text-[9px] uppercase font-mono font-bold">
                  {label}:
                </span>
              )}
              <span className="font-bold truncate max-w-[120px] sm:max-w-[160px] text-zinc-800 dark:text-zinc-200">
                {displayName}
              </span>
              {displayRole && size !== "xs" && (
                <span className="text-[9px] font-mono px-1 rounded bg-zinc-200/60 dark:bg-zinc-700/60 text-zinc-500 dark:text-zinc-400">
                  {displayRole}
                </span>
              )}
            </div>

            {isEditable && (
              <ChevronDown className="w-2.5 h-2.5 text-zinc-400 opacity-60 group-hover:opacity-100 shrink-0" />
            )}
          </>
        ) : (
          <div className="flex items-center gap-1">
            <IconComponent className={cn("shrink-0 opacity-70", size === "xs" ? "w-2.5 h-2.5" : "w-3 h-3")} />
            <span>{placeholder}</span>
            {isEditable && <ChevronDown className="w-2.5 h-2.5 opacity-50" />}
          </div>
        )}
      </button>

      {/* Popover User Picker Rendered into Body via React Portal to Avoid Clipping */}
      {isOpen &&
        popoverCoords &&
        ReactDOM.createPortal(
          <div
            ref={popoverRef}
            style={{
              position: "fixed",
              top: `${popoverCoords.top}px`,
              left: `${popoverCoords.left}px`,
              width: "280px",
              zIndex: 99999,
            }}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-[11px] font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <IconComponent className="w-3.5 h-3.5 text-indigo-500" />
                Assign {variant}
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search team members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                autoFocus
              />
            </div>

            {/* Member List */}
            <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
              {/* Unassign Option */}
              <button
                type="button"
                onClick={() => handleChoose(null)}
                className={cn(
                  "w-full flex items-center justify-between p-1.5 rounded-xl text-xs text-left transition-colors cursor-pointer",
                  !currentId
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center text-[10px]">
                    ∅
                  </div>
                  <span>Unassigned (None)</span>
                </div>
                {!currentId && <Check className="w-3.5 h-3.5 text-indigo-600" />}
              </button>

              {filteredMembers.map((member) => {
                const isSelected = member.id === currentId;
                const grad = getAvatarColor(member.id || member.name);
                const mInitial = member.name ? member.name.charAt(0).toUpperCase() : "U";

                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => handleChoose(member.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-1.5 rounded-xl text-xs text-left transition-colors cursor-pointer",
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full text-white flex items-center justify-center text-[9px] font-black bg-gradient-to-tr shrink-0",
                          grad
                        )}
                      >
                        {mInitial}
                      </div>
                      <div className="truncate">
                        <div className="font-semibold truncate">
                          {member.name || member.phone}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {member.role || "MEMBER"} {member.activeTasksCount ? `• ${member.activeTasksCount} active` : ""}
                        </div>
                      </div>
                    </div>

                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                  </button>
                );
              })}

              {filteredMembers.length === 0 && (
                <div className="py-3 text-center text-xs text-zinc-400">
                  No matching members found
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
