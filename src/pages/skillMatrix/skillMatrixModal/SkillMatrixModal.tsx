import { FC, useEffect, useState } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Button, FormHelperText, MenuItem, TextField } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import { Stack } from '@mui/system';

import { useMounted } from 'src/hooks/use-mounted';
import { TOKEN_STORAGE_KEY } from 'src/contexts/auth/jwt/auth-provider';
import axios from 'axios';
import { User } from 'src/types/user';
import { Skill } from 'src/types/skill';

interface UserSkillsValues {
  user: string;
  skill: string;
  level: string;
  submit: null;
}

const initialValues: UserSkillsValues = {
  user: '',
  skill: '',
  level: '',
  submit: null,
};

const validationSchema = Yup.object({
  user: Yup.string().max(255).required('User is required'),
  skill: Yup.string().max(255).required('Skill is required'),
  level: Yup.string().max(255).required('Level is required'),
});

interface UserSkillsModalProps {
  onClose: () => void;
  onRefresh?: () => void;
  open: boolean;
  userskillsId?: string;
}

export const SkillMatrixModal: FC<UserSkillsModalProps> = (props) => {
  const { userskillsId, onClose, onRefresh, open = false, ...other } = props;
  const isMounted = useMounted();
  const [users, setUsers] = useState<User[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    const getUsers = async () => {
      const accessToken = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
      const response = await axios<{ users: User[] }>({
        method: 'get',
        url: 'http://localhost:8080/api/users',
        headers: { 'x-access-token': accessToken },
      });
      setUsers(response.data.users.filter((u) => u.role === 'Developper'));
    };

    const getSkills = async () => {
      const accessToken = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
      const response = await axios({
        method: 'get',
        url: 'http://localhost:8080/api/skills',
        headers: { 'x-access-token': accessToken },
      });
      setSkills(response.data.skills);
    };

    getUsers();
    getSkills();
  }, []);

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, helpers): Promise<void> => {
      try {
        const accessToken = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
        await axios({
          method: 'post',
          url: 'http://localhost:8080/api/user-skills',
          headers: { 'Content-Type': 'application/json', 'x-access-token': accessToken },
          data: {
            user: values.user,
            skill: values.skill,
            level: values.level,
          },
        });

        if (onRefresh) {
          onRefresh();
        }
        formik.resetForm();
        onClose();
      } catch (err) {
        console.error(err);

        if (isMounted()) {
          helpers.setStatus({ success: false });
          helpers.setErrors({ submit: err.message });
          helpers.setSubmitting(false);
        }
      }
    },
  });

  return (
    <Drawer
      anchor="right"
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          width: '100%',
          maxWidth: 500,
        },
      }}
      {...other}
    >
      <>
        <Stack
          direction="column"
          spacing={3}
          sx={{ p: 3 }}
        >
          <Stack
            justifyContent="start"
            spacing={3}
            direction="row"
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => formik.handleSubmit()}
              fullWidth={false}
            >
              Save
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={onClose}
              fullWidth={false}
            >
              cancel
            </Button>
          </Stack>
          <div>
            <form
              noValidate
              onSubmit={formik.handleSubmit}
            >
              <Stack
                direction="column"
                flexGrow={1}
                spacing={3}
              >
                <TextField
                  error={!!(formik.touched.user && formik.errors.user)}
                  fullWidth
                  helperText={formik.touched.user && formik.errors.user}
                  label="User"
                  name="user"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="text"
                  value={formik.values.user}
                  select
                >
                  {users.map((u) => (
                    <MenuItem
                      key={u._id}
                      value={u.email}
                    >
                      {u.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  error={!!(formik.touched.skill && formik.errors.skill)}
                  fullWidth
                  helperText={formik.touched.skill && formik.errors.skill}
                  label="Skill"
                  name="skill"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="text"
                  value={formik.values.skill}
                  select
                >
                  {skills.map((u) => (
                    <MenuItem
                      key={u._id}
                      value={u.label}
                    >
                      {u.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  error={!!(formik.touched.level && formik.errors.level)}
                  fullWidth
                  helperText={formik.touched.level && formik.errors.level}
                  label="Level"
                  name="level"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="text"
                  value={formik.values.level}
                  select
                >
                  <MenuItem value={'1'}>1</MenuItem>
                  <MenuItem value={'2'}>2</MenuItem>
                  <MenuItem value={'3'}>3</MenuItem>
                  <MenuItem value={'4'}>4</MenuItem>
                </TextField>
              </Stack>
              {formik.errors.submit && (
                <FormHelperText
                  error
                  sx={{ mt: 3 }}
                >
                  {formik.errors.submit as string}
                </FormHelperText>
              )}
            </form>
          </div>
        </Stack>
      </>
    </Drawer>
  );
};
