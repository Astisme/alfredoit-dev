type LocaleResult = {
  locale: string;
  restOfPath?: string;
  relativePage?: string;
};

export function getCurrentLocale({
  url,
  givenLocale = null,
  returnRestOfPath = givenLocale != null,
  returnRelativePage = false,
}: {
  url: URL;
  givenLocale?: string | null;
  returnRestOfPath?: boolean;
  returnRelativePage?: boolean;
}): LocaleResult {
  const result = {} as LocaleResult;
  if (
    givenLocale != null && returnRestOfPath === false &&
    returnRelativePage === false
  ) {
    result.locale = givenLocale;
    return result;
  }
  const currentPage = `${url.toString()}/`.replaceAll("//", "/");
  const origin = url.origin;
  const relativePage = currentPage.substring(
    currentPage.indexOf(origin) + origin.length + 1,
  );
  if (returnRelativePage === true) {
    result.relativePage = relativePage;
    if (givenLocale != null && returnRestOfPath === false) {
      result.locale = givenLocale;
      return result;
    }
  }
  function getRestOfPath(): string {
    const locale = result.locale;
    return relativePage.substring(relativePage.indexOf(locale) + locale.length);
  }
  if (givenLocale != null && returnRestOfPath === true) {
    result.locale = givenLocale;
    result.restOfPath = getRestOfPath();
    return result;
  }
  const [locale] = relativePage.split("/", 1);
  if (locale == null) {
    throw new Error("locale was not found");
  }
  result.locale = locale;
  if (!returnRestOfPath) {
    return result;
  }
  result.restOfPath = getRestOfPath();
  return result;
}
