function validateField(value, fieldName, minLength, maxLength) {
  const validationErrors = [];

  if (!value) {
    validationErrors.push({
      field: fieldName,
      message: `Veuillez entrer un ${fieldName}`,
    });

    
  } else {
    if (value.length < minLength) {
      validationErrors.push({
        field: fieldName,
        message: `Le ${fieldName} doit avoir au moins ${minLength} caractères`,
      });
    }

    if (value.length > maxLength) {
      validationErrors.push({
        field: fieldName,
        message: `Le ${fieldName} ne doit pas avoir plus de ${maxLength} caractères`,
      });
    }
  }

  return validationErrors;
}

module.exports = { validateField };
