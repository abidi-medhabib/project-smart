import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SvgIcon from '@mui/material/SvgIcon';

import HomeSmileIcon from 'src/icons/untitled-ui/duocolor/home-smile';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BackupTableIcon from '@mui/icons-material/BackupTable';
import GroupIcon from '@mui/icons-material/Group';
import { tokens } from 'src/locales/tokens';
import { paths } from 'src/paths';
import { STORAGE_USER_KEY } from 'src/contexts/auth/jwt/auth-provider';
import { User } from 'src/types/user';

export interface Item {
  disabled?: boolean;
  external?: boolean;
  icon?: ReactNode;
  items?: Item[];
  label?: ReactNode;
  path?: string;
  title: string;
}

export interface Section {
  items: Item[];
  subheader?: string;
}

export const useSections = () => {
  const { t } = useTranslation();
  const [role, setRole] = useState<string | undefined>();
  const userData = window.sessionStorage.getItem(STORAGE_USER_KEY);

  useEffect(() => {
    if (userData) {
      const user: User = JSON.parse(userData) as User;
      if (user) {
        setRole(user.role);
      }
    }
  }, [userData]);

  return useMemo(() => {
    const publicRoutes = [
      {
        title: t(tokens.nav.projects),
        path: paths.main.index,
        icon: (
          <SvgIcon fontSize="small">
            <HomeSmileIcon />
          </SvgIcon>
        ),
      },
    ];
    const pmRoutes = [
      {
        title: t(tokens.nav.skills),
        path: paths.main.skills,
        icon: (
          <SvgIcon fontSize="medium">
            <PsychologyIcon />
          </SvgIcon>
        ),
      },
      {
        title: t(tokens.nav.skillMatrix),
        path: paths.main.skillMatrix,
        icon: (
          <SvgIcon fontSize="medium">
            <BackupTableIcon />
          </SvgIcon>
        ),
      },
    ];
    const adminRoutes = [
      {
        title: t(tokens.nav.users),
        path: paths.main.users,
        icon: (
          <SvgIcon fontSize="medium">
            <GroupIcon />
          </SvgIcon>
        ),
      },
    ];

    return [
      {
        items:
          role === 'Admin'
            ? [...publicRoutes, ...pmRoutes, ...adminRoutes]
            : role === 'Project Manager'
            ? [...publicRoutes, ...pmRoutes]
            : [...publicRoutes],
      },
    ];
  }, [t, role]);
};
