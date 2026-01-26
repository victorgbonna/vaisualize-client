const useValidations = () => {
  const isEmail = (value) => {
    if (!value) return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return regex.test(value);
  };

  const isLength = ({ value, minlength = 0, maxlength = Infinity }) => {
    if (typeof value !== "string") return false;
    return value.length >= minlength && value.length <= maxlength;
  };

  const isUrl = (value) => {
    if (!value) return false;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  return {
    isEmail,
    isLength,
    isUrl,
  };
};

export default useValidations;
