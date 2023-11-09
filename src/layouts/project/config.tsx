import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SvgIcon from '@mui/material/SvgIcon';

import CheckDone01Icon from 'src/icons/untitled-ui/duocolor/check-done-01';
import HomeSmileIcon from 'src/icons/untitled-ui/duocolor/home-smile';
import { tokens } from 'src/locales/tokens';
import { paths } from 'src/paths';
import { useParams } from 'react-router-dom';

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
  const params = useParams();

  return useMemo(() => {
    return [
      {
        items: [
          {
            title: t(tokens.nav.overview),
            path: paths.projects.index.replace(":projectId", params.projectId!),
            icon: (
              <SvgIcon fontSize="small">
                <HomeSmileIcon />
              </SvgIcon>
            ),
          },
          {
            title: t(tokens.nav.kanban),
            path: paths.projects.kanban.replace(":projectId", params.projectId!),
            icon: (
              <SvgIcon fontSize="small">
                <CheckDone01Icon />
              </SvgIcon>
            ),
          }
        ],
      },
    ];
  }, [t]);
};
