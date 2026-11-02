export type Role =
  | "customer"
  | "admin" // CEO
  | "md" // Managing Director
  | "manager"
  | "accountant"
  | "employee";

export const STAFF_ROLES: Role[] = ["admin", "md", "manager", "accountant", "employee"];

export const ROLE_LABELS: Record<Role, string> = {
  customer: "Customer",
  admin: "CEO",
  md: "Managing Director",
  manager: "Manager",
  accountant: "Accountant",
  employee: "Employee",
};

// Job roles the MD can give to an employee (never admin or md)
export const APPOINTABLE_ROLES: Role[] = ["manager", "accountant", "employee"];

export const isStaff = (role?: string) => STAFF_ROLES.includes(role as Role);

// Products, orders and other data: only the CEO deletes
export const canDelete = (role?: string) => role === "admin";

// Staff rules
export const canApproveStaff = (role?: string) => role === "md"; // CEO cannot approve
export const canAppointRole = (role?: string) => role === "md";
export const canAssignMd = (role?: string) => role === "admin";
// MD can delete employees, never the CEO, and never another MD (so never himself)
export const canDeleteStaff = (actorRole?: string, targetRole?: string) =>
  actorRole === "md" && targetRole !== "admin" && targetRole !== "md";

export const ADMIN_MENU = [
  { label: "Dashboard", href: "/admin", roles: ["admin", "md", "manager", "accountant", "employee"] },
  { label: "Products", href: "/admin/products", roles: ["admin", "md", "manager", "employee"] },
  { label: "Orders", href: "/admin/orders", roles: ["admin", "md", "manager", "employee", "accountant"] },
  { label: "Customers", href: "/admin/customers", roles: ["admin", "md", "manager"] },
  { label: "Staff", href: "/admin/staff", roles: ["admin", "md"] },
  { label: "Account", href: "/admin/account", roles: ["admin", "md", "manager", "accountant", "employee"] },
];

// Which roles may open which URL
export const canAccess = (role: string | undefined, path: string) => {
  const item = [...ADMIN_MENU]
    .sort((a, b) => b.href.length - a.href.length)
    .find((m) => path === m.href || path.startsWith(m.href + "/"));
  return !!item && !!role && item.roles.includes(role);
};