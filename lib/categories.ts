import { productCategories, type Category } from "@/config/site";

export type FlatCategory = {
  label: string;
  value: string;
  path: string; // "Women's & Girls' Fashion › Clothing › Blouses"
  depth: number; // 0 = top level
};

// Every category at every level in one list
export function flattenCategories(
  list: Category[] = productCategories,
  parents: string[] = []
): FlatCategory[] {
  const out: FlatCategory[] = [];
  for (const c of list) {
    const trail = [...parents, c.label];
    out.push({
      label: c.label,
      value: c.value,
      path: trail.join(" › "),
      depth: parents.length,
    });
    if (c.children?.length) out.push(...flattenCategories(c.children, trail));
  }
  return out;
}

// The chain from top level down to the category, for breadcrumbs
export function categoryTrail(
  value: string,
  list: Category[] = productCategories
): Category[] | null {
  for (const c of list) {
    if (c.value === value) return [c];
    if (c.children?.length) {
      const sub = categoryTrail(value, c.children);
      if (sub) return [c, ...sub];
    }
  }
  return null;
}

export function findCategory(value: string): Category | null {
  const trail = categoryTrail(value);
  return trail ? trail[trail.length - 1] : null;
}

function collect(c: Category): string[] {
  return [c.value, ...(c.children ?? []).flatMap(collect)];
}

// The category itself plus everything below it. Null if the value is unknown.
export function descendantValues(value: string): string[] | null {
  const c = findCategory(value);
  return c ? collect(c) : null;
}

export function categoryLabel(value: string | null | undefined): string {
  if (!value) return "";
  return findCategory(value)?.label ?? value;
}