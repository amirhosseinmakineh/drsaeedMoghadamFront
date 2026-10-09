export const servicePath = (id: string): string =>
  id === "composite"
    ? "/composite"
    : id === "whitening"
      ? "/bleaching"
      : `/services/${id}`;
