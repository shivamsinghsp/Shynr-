/**
 * Role Permissions System for Shynr
 * 
 * Role Hierarchy:
 * - admin: Super Admin (full access)
 * - sub_admin: Sub Admin (can manage jobs, employees, but cannot change roles/deactivate)
 * - employee: Employee (attendance, leave, basic access)
 * - user: Regular user (job seeker)
 */

export const ROLE_HIERARCHY = {
    admin: 100,       // Super Admin - full access
    sub_admin: 50,    // Sub Admin - limited admin access
    employee: 20,     // Employee - employee features
    user: 10,         // User - basic access
} as const;

export type UserRole = 'admin' | 'sub_admin' | 'employee' | 'user';

/**
 * Check if a role can promote/demote users
 * Only Super Admin can do this
 */
export const canChangeRole = (actorRole: string): boolean =>
    actorRole === 'admin';

/**
 * Check if a role can deactivate users
 * Only Super Admin can do this
 */
export const canDeactivateUser = (actorRole: string): boolean =>
    actorRole === 'admin';

/**
 * Check if a role can manage jobs (add/edit/delete)
 * Both admin and sub_admin can do this
 */
export const canManageJobs = (actorRole: string): boolean =>
    ['admin', 'sub_admin'].includes(actorRole);

/**
 * Check if a role can manage employees
 * Both admin and sub_admin can do this
 */
export const canManageEmployees = (actorRole: string): boolean =>
    ['admin', 'sub_admin'].includes(actorRole);

/**
 * Check if a role can access admin panel
 */
export const canAccessAdminPanel = (actorRole: string): boolean =>
    ['admin', 'sub_admin'].includes(actorRole);

/**
 * Check if a role can view system logs
 * Only Super Admin can do this
 */
export const canViewSystemLogs = (actorRole: string): boolean =>
    actorRole === 'admin';

/**
 * Check if a role can manage other admins/sub-admins
 * Only Super Admin can do this
 */
export const canManageAdmins = (actorRole: string): boolean =>
    actorRole === 'admin';

/**
 * Get promotable roles for a given actor role
 * Super Admin can promote to: employee, sub_admin
 * Sub Admin cannot promote anyone
 */
export const getPromotableRoles = (actorRole: string): UserRole[] => {
    if (actorRole === 'admin') {
        return ['employee', 'sub_admin'];
    }
    return [];
};

/**
 * Validate if actor can perform action on target role
 */
export const canActOnRole = (actorRole: string, targetRole: string, action: 'promote' | 'demote' | 'deactivate'): boolean => {
    // Only super admin can perform role-changing actions
    if (actorRole !== 'admin') {
        return false;
    }

    // Cannot modify another super admin's role
    if (targetRole === 'admin') {
        return false;
    }

    return true;
};
