export const generateSlug = (name: string): string => {
  const baseSlug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  const uniqueSuffix =
    Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  return `${baseSlug}-${uniqueSuffix}`;
};
