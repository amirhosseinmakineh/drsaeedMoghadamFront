export const servicePath = (id) =>
  id === "composite"
    ? "/composite"
    : id === "whitening"
      ? "/bleaching"
      : `/services/${id}`;
