export const exists = (input) => input.length === 0 && 'You must write something.'
export const maxLength = (length = 40) => (input) =>
  input.length > length && `Must be less than ${length} characters long.`
