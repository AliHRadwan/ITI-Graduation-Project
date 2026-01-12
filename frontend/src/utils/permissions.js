export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  READONLY: 'readonly',
};

export const hasRole = (user, roles) => {
  if (!user) return false;
  
  const rolesArray = (Array.isArray(roles) ? roles : [roles]).map((role) =>
    typeof role === 'string' ? role.toLowerCase() : role
  );
  
  // Check if user has direct role property (old structure)
  if (user.role) {
    if (typeof user.role === 'string') {
      return rolesArray.includes(user.role.toLowerCase());
    }
    const roleSlug = user.role.slug || user.role.name?.toLowerCase();
    return rolesArray.includes(roleSlug);
  }
  
  // Check if user has memberships array (Laravel backend structure)
  if (user.memberships && Array.isArray(user.memberships)) {
    return user.memberships.some(membership => {
      // Handle role as a string (e.g., "Admin", "Manager", "Staff")
      if (typeof membership.role === 'string') {
        const roleSlug = membership.role.toLowerCase();
        return rolesArray.includes(roleSlug);
      }
      
      // Handle role as an object with slug or name
      const roleSlug = membership.staff_role?.slug || 
                      membership.staff_role?.name?.toLowerCase() ||
                      membership.role?.slug ||
                      membership.role?.name?.toLowerCase();
      return roleSlug && rolesArray.includes(roleSlug);
    });
  }
  
  return false;
};

export const isAdmin = (user) => hasRole(user, ROLES.ADMIN);
export const isManager = (user) => hasRole(user, ROLES.MANAGER);
export const isStaff = (user) => hasRole(user, ROLES.STAFF);
export const isReadOnly = (user) => hasRole(user, ROLES.READONLY);
export const isManagerOrAdmin = (user) => hasRole(user, [ROLES.ADMIN, ROLES.MANAGER]);
export const isStaffRole = (user) => hasRole(user, [ROLES.STAFF, ROLES.READONLY]);
