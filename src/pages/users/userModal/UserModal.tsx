import { FC, useEffect } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Button, FormHelperText, MenuItem, TextField } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import { Stack } from '@mui/system';

import { Role, User } from 'src/types/user';
import { useMounted } from 'src/hooks/use-mounted';
import { authApi } from 'src/api/auth';
import { createResourceId } from 'src/utils/create-resource-id';
import { TOKEN_STORAGE_KEY } from 'src/contexts/auth/jwt/auth-provider';
import axios from 'axios';

interface UserValues {
  email: string;
  name: string;
  role: Role;
  password: string;
  submit: null;
}

const initialValues: UserValues = {
  email: '',
  password: '',
  name: '',
  role: 'Developper',
  submit: null,
};

const validationSchema = Yup.object({
  email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
  password: Yup.string().max(255).required('Password is required'),
  name: Yup.string().max(255).required('Name is required'),
  role: Yup.mixed()
    .oneOf(['Admin', 'Project Manager', 'Manager', 'Developper'])
    .required('Name is required'),
});

interface UserModalProps {
  onClose: () => void;
  onRefresh?: () => void;
  open: boolean;
  userId?: string;
  user: User | null;
}

export const UserModal: FC<UserModalProps> = (props) => {
  const { userId, user, onClose, onRefresh, open = false, ...other } = props;
  const isMounted = useMounted();

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, helpers): Promise<void> => {
      try {
        authApi.saveUser({
          _id: user ? user._id : createResourceId(),
          email: values.email,
          name: values.name,
          role: values.role,
          password: values.password,
        });

        const accessToken = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
        await axios({
          method: 'post',
          url: 'http://localhost:8080/api/users',
          headers: { 'Content-Type': 'application/json', 'x-access-token': accessToken },
          data: {
            _id: user ? user._id : undefined,
            email: values.email,
            name: values.name,
            role: values.role,
            password: values.password,
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

  useEffect(() => {
    if (user) {
      formik.resetForm({
        values: {
          email: user.email,
          password: user.password!,
          name: user.name,
          role: user.role,
          submit: null,
        },
      });
    }
  }, [user]);

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
                  autoFocus
                  error={!!(formik.touched.name && formik.errors.name)}
                  fullWidth
                  helperText={formik.touched.name && formik.errors.name}
                  label="Name"
                  name="name"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="text"
                  value={formik.values.name}
                />
                <TextField
                  error={!!(formik.touched.email && formik.errors.email)}
                  fullWidth
                  helperText={formik.touched.email && formik.errors.email}
                  label="Email Address"
                  name="email"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="email"
                  value={formik.values.email}
                  autoComplete="no"
                />
                <TextField
                  error={!!(formik.touched.password && formik.errors.password)}
                  fullWidth
                  helperText={formik.touched.password && formik.errors.password}
                  label="Password"
                  name="password"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="password"
                  value={formik.values.password}
                  autoComplete="no"
                  disabled={user !== null}
                />
                <TextField
                  error={!!(formik.touched.role && formik.errors.role)}
                  fullWidth
                  helperText={formik.touched.role && formik.errors.role}
                  label="Role"
                  name="role"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  select
                  value={formik.values.role}
                  autoComplete="no"
                >
                  <MenuItem value={'Admin'}>Admin</MenuItem>
                  <MenuItem value={'Developper'}>Developper</MenuItem>
                  <MenuItem value={'Manager'}>Manager</MenuItem>
                  <MenuItem value={'Project Manager'}>Project Manager</MenuItem>
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
