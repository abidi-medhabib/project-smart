import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import PlusIcon from '@untitled-ui/icons-react/build/esm/Plus';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';

import { usePopover } from 'src/hooks/use-popover';
import { Skill } from 'src/types/skill';
import { TOKEN_STORAGE_KEY } from 'src/contexts/auth/jwt/auth-provider';
import axios from 'axios';

const options: string[] = ['Business', 'Planning', 'Frontend', 'Design'];

interface TaskLabelsProps {
  labels?: string[];
  onChange?: (labels: string[]) => void;
}

export const TaskLabels: FC<TaskLabelsProps> = (props) => {
  const { labels = [], onChange } = props;
  const popover = usePopover<HTMLButtonElement>();

  const [skills, setSkills] = useState<Skill[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const accessToken = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
      const response = await axios({
        method: 'get',
        url: 'http://localhost:8080/api/skills',
        headers: { 'x-access-token': accessToken },
      });
      setSkills(response.data.skills);
    };

    fetchData();
  }, []);

  const availableOptions = useMemo(() => {
    return skills.filter((option) => !labels.includes(option.label));
  }, [skills, labels]);

  const handleDelete = useCallback(
    (label: string) => {
      const newLabels = labels.filter((item) => item !== label);

      onChange?.(newLabels);
    },
    [labels, onChange]
  );

  const handleToggle = useCallback(
    (label: string) => {
      let newLabels: string[];

      const found = labels.find((item) => item === label);

      if (found) {
        newLabels = labels.filter((item) => item !== label);
      } else {
        newLabels = [...labels, label];
      }

      popover.handleClose();
      onChange?.(newLabels);
    },
    [labels, popover, onChange]
  );

  const canAdd = availableOptions.length > 0;

  return (
    <>
      <Stack
        alignItems="center"
        direction="row"
        flexWrap="wrap"
        gap={1}
      >
        {labels.map((label) => (
          <Chip
            key={label}
            label={label}
            onDelete={() => handleDelete(label)}
            size="small"
          />
        ))}
        <IconButton
          onClick={popover.handleOpen}
          ref={popover.anchorRef}
          disabled={!canAdd}
        >
          <SvgIcon fontSize="small">
            <PlusIcon />
          </SvgIcon>
        </IconButton>
      </Stack>
      <Menu
        anchorEl={popover.anchorRef.current}
        anchorOrigin={{
          horizontal: 'right',
          vertical: 'bottom',
        }}
        onClose={popover.handleClose}
        open={popover.open}
        transformOrigin={{
          horizontal: 'right',
          vertical: 'top',
        }}
      >
        {availableOptions.map((option) => (
          <MenuItem
            key={option.label}
            onClick={() => handleToggle(option.label)}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

TaskLabels.propTypes = {
  labels: PropTypes.arrayOf(PropTypes.string.isRequired),
  onChange: PropTypes.func,
};
