// Role-based access control middleware
const roles = {
    VISITOR: 'visitor',
    ADMIN: 'admin',
    SUPERADMIN: 'superadmin'
  };
  
  // Role hierarchy
  const roleHierarchy = {
    [roles.VISITOR]: 0,
    [roles.ADMIN]: 1,
    [roles.SUPERADMIN]: 2
  };
  
  // Check if user has sufficient role level
  const hasRoleLevel = (userRole, requiredRole) => {
    if (!roleHierarchy[userRole]) return false;
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  };
  
  // Export roles constants and helpers
  module.exports = {
    roles,
    roleHierarchy,
    hasRoleLevel
  };