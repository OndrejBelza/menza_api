const normalizeMealName = (name: string): string => {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[\s.,?!]/g, "");
};

export default normalizeMealName;
