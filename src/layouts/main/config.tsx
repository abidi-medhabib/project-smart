import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SvgIcon from '@mui/material/SvgIcon';

import HomeSmileIcon from 'src/icons/untitled-ui/duocolor/home-smile';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BackupTableIcon from '@mui/icons-material/BackupTable';
import GroupIcon from '@mui/icons-material/Group';
import { tokens } from 'src/locales/tokens';
import { paths } from 'src/paths';

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

  return useMemo(() => {
    return [
      {
        items: [
          {
            title: t(tokens.nav.projects),
            path: paths.main.index,
            icon: (
              <SvgIcon fontSize="small">
                <HomeSmileIcon />
              </SvgIcon>
            ),
          },
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
          {
            title: t(tokens.nav.users),
            path: paths.main.users,
            icon: (
              <SvgIcon fontSize="medium">
                <GroupIcon />
              </SvgIcon>
            ),
          },
        ],
      }
    ];
  }, [t]);
};
