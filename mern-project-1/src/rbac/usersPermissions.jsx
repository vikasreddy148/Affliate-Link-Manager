import { useSelector } from "react-redux";

export const ROLE_PERMISSIONS = {
  admin: {
    canViewUser: true,
    canCreateUser: true,
    canDeleteUser: true,
    canEditUser: true,
    canViewLink: true,
    canCreateLink: true,
    canDeleteLink: true,
    canEditLink: true,
  },
  developer: {
    canViewUser: false,
    canCreateUser: false,
    canDeleteUser: false,
    canEditUser: false,
    canViewLink: true,
    canCreateLink: false,
    canDeleteLink: false,
    canEditLink: false,
  },
  viewer: {
    canViewUser: true,
    canCreateUser: false,
    canDeleteUser: false,
    canEditUser: false,
    canViewLink: false,
    canCreateLink: false,
    canDeleteLink: false,
    canEditLink: false,
  },
};

export const usePermission = () => {
  const user = useSelector((state) => state.userDetails);
  return ROLE_PERMISSIONS[user?.role] || {};
};
