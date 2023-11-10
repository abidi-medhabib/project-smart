import { useState, type FC, useEffect } from 'react';
import PropTypes from 'prop-types';
import Menu01Icon from '@untitled-ui/icons-react/build/esm/Menu01';
import { alpha } from '@mui/system/colorManipulator';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { Theme } from '@mui/material/styles/createTheme';

import { AccountButton } from '../account-button';
import { LanguageSwitch } from '../language-switch';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/paths';
import { useProjectsStore } from 'src/pages/projects/Projects';
import { useParams } from 'react-router-dom';
import { useMounted } from 'src/hooks/use-mounted';
import { projectsApi } from 'src/api/projects/projectApi';

const TOP_NAV_HEIGHT = 64;
const SIDE_NAV_WIDTH = 280;

interface TopNavProps {
  onMobileNavOpen?: () => void;
}

export const TopNav: FC<TopNavProps> = (props) => {
  const { onMobileNavOpen, ...other } = props;
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
  const params = useParams();
  //const projectsStore = useProjectsStore({ filters: {} });

  return (
    <Box
      component="header"
      sx={{
        backdropFilter: 'blur(6px)',
        backgroundColor: (theme) => alpha(theme.palette.background.default, 0.8),
        position: 'sticky',
        left: {
          lg: `${SIDE_NAV_WIDTH}px`,
        },
        top: 0,
        width: {
          lg: `calc(100% - ${SIDE_NAV_WIDTH}px)`,
        },
        zIndex: (theme) => theme.zIndex.appBar,
      }}
      {...other}
    >
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        spacing={2}
        sx={{
          minHeight: TOP_NAV_HEIGHT,
          px: 2,
        }}
      >
        <Stack
          alignItems="center"
          direction="row"
          spacing={2}
        >
          {!lgUp && (
            <IconButton onClick={onMobileNavOpen}>
              <SvgIcon>
                <Menu01Icon />
              </SvgIcon>
            </IconButton>
          )}
          {params.projectId && (
            <Stack
              direction="row"
              spacing={1}
            >
              <Link
                color="text.primary"
                component={RouterLink}
                href="/"
                sx={{
                  alignItems: 'center',
                  display: 'inline-flex',
                }}
                underline="hover"
              >
                <Typography variant="subtitle2">Home</Typography>
              </Link>
              <Typography variant="subtitle2">{`>`}</Typography>
              <Typography variant="subtitle2">{`Project deails`}</Typography>
            </Stack>
          )}
        </Stack>
        <Stack
          alignItems="center"
          direction="row"
          spacing={2}
        >
          <LanguageSwitch />
          <AccountButton />
        </Stack>
      </Stack>
    </Box>
  );
};

TopNav.propTypes = {
  onMobileNavOpen: PropTypes.func,
};
