import { FC } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Button, FormHelperText, MenuItem, TextField } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import { Stack } from '@mui/system';

import { useMounted } from 'src/hooks/use-mounted';
import { authApi } from 'src/api/auth';
import { createResourceId } from 'src/utils/create-resource-id';
import { skillsApi } from 'src/api/skills/skillApi';
import { TOKEN_STORAGE_KEY } from 'src/contexts/auth/jwt/auth-provider';
import axios from 'axios';

interface SkillValues {
  label: string;
  submit: null;
}

const initialValues: SkillValues = {
  label: '',
  submit: null,
};

const validationSchema = Yup.object({
  label: Yup.string().max(255).required('Label is required'),
});

interface SkillModalProps {
  onClose: () => void;
  onRefresh?: () => void;
  open: boolean;
  skillId?: string;
}

export const SkillModal: FC<SkillModalProps> = (props) => {
  const { skillId, onClose, onRefresh, open = false, ...other } = props;
  const isMounted = useMounted();

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, helpers): Promise<void> => {
      try {
        const accessToken = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
        await axios({
          method: 'post',
          url: 'http://localhost:8080/api/skills',
          headers: { 'Content-Type': 'application/json', 'x-access-token': accessToken },
          data: {
            label: values.label,
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
                  autoFocus
                  error={!!(formik.touched.label && formik.errors.label)}
                  fullWidth
                  helperText={formik.touched.label && formik.errors.label}
                  label="Label"
                  name="label"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="text"
                  value={formik.values.label}
                />
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
