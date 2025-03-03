export function validateTemplateName(templateName: string) {
  // Trim input
  templateName = templateName.trim();

  // Check if empty
  if (!templateName) {
    return "Template name is required.";
  }

  // Length check
  if (templateName.length < 3 || templateName.length > 50) {
    return "Template name must be between 3 and 50 characters.";
  }

  // Character restriction check
  const namePattern = /^[a-zA-Z0-9-_ ]+$/;
  if (!namePattern.test(templateName)) {
    return "Template name can only contain letters, numbers, spaces, dashes, and underscores.";
  }

  // All checks passed
  return null;
}

export function validateGroupName(groupName: string) {
  // Trim input
  groupName = groupName.trim();

  // Check if empty
  if (!groupName) {
    return "Group name is required.";
  }

  // Length check
  if (groupName.length < 3 || groupName.length > 50) {
    return "Group name must be between 3 and 50 characters.";
  }

  // Character restriction check
  const namePattern = /^[a-zA-Z0-9-_ ]+$/;
  if (!namePattern.test(groupName)) {
    return "Group name can only contain letters, numbers, spaces, dashes, and underscores.";
  }

  // All checks passed
  return null;
}

export function validateUnitName(unitName: string): string | null {
  // Trim input
  unitName = unitName.trim();

  // Check if empty
  if (!unitName) {
    return "Unit name is required.";
  }

  // Length check
  if (unitName.length < 1 || unitName.length > 20) {
    return "Unit name must be between 1 and 20 characters.";
  }

  // Disallow consecutive spaces
  if (/\s{2,}/.test(unitName)) {
    return "Unit name cannot contain consecutive spaces.";
  }

  // Character restriction check (allows letters, numbers, spaces, dashes, underscores, and periods)
  const namePattern = /^[a-zA-Z0-9-_. ]+$/;
  if (!namePattern.test(unitName)) {
    return "Unit name can only contain letters, numbers, spaces, dashes, underscores, and periods.";
  }

  // All checks passed
  return null;
}

export function isValidNumber(input: string) {
  // Allow empty input
  if (input === "") return true;

  // Regular expression to allow only valid numeric values
  const regex = /^-?\d*\.?\d*$/;

  // Check for multiple decimal points or invalid characters
  if (!regex.test(input)) {
    return false;
  }

  return true;
}
