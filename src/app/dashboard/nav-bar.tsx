import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import type { User } from "@supabase/supabase-js";
import { logoutAction } from "@/app/auth/logout";

type Props = {
  user: User;
};

type UserMeta = {
  full_name?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
};

function getUserMeta(user: User): UserMeta {
  return user.user_metadata as UserMeta;
}

export function getDisplayName(user: User): string {
  const meta = getUserMeta(user);
  if (meta.full_name) return meta.full_name.trim();
  if (meta.first_name) {
    return meta.last_name
      ? `${meta.first_name} ${meta.last_name}`.trim()
      : meta.first_name.trim();
  }
  return user.email ?? "";
}

function getInitials(user: User): string {
  const meta = getUserMeta(user);

  if (meta.full_name) {
    const parts = meta.full_name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }

  if (meta.first_name && meta.last_name) {
    return `${meta.first_name[0]}${meta.last_name[0]}`.toUpperCase();
  }

  const email = user.email ?? "";
  return email.length > 0 ? email[0].toUpperCase() : "?";
}

export function NavBar({ user }: Props) {
  const initials = getInitials(user);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-base-200 bg-base-100">
      <span className="text-xl font-semibold tracking-tight text-primary">
        VDV LMS
      </span>
      <div className="flex items-center gap-2">
        <div className="avatar avatar-placeholder">
          <div className="bg-secondary text-secondary-content rounded-full w-9">
            <span className="text-sm font-medium">{initials}</span>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="btn btn-ghost btn-square btn-sm"
            aria-label="Log out"
            title="Log out"
          >
            <ArrowRightStartOnRectangleIcon className="size-5 text-base-content/60" />
          </button>
        </form>
      </div>
    </header>
  );
}
