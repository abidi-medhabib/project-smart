import { FC } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Button, FormHelperText, MenuItem, TextField } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import { Stack } from '@mui/system';

import { useMounted } from 'src/hooks/use-mounted';
import { authApi } from 'src/api/auth';
import { createResourceId } from 'src/utils/create-resource-id';
import { projectsApi } from 'src/api/projects/projectApi';

interface ProjectValues {
  name: string;
  description: string;
  submit: null;
}

const initialValues: ProjectValues = {
  name: '',
  description: '',
  submit: null,
};

const validationSchema = Yup.object({
  name: Yup.string().max(255).required('Name is required'),
});

interface ProjectModalProps {
  onClose: () => void;
  onRefresh?: () => void;
  open: boolean;
  projectId?: string;
}

export const ProjectModal: FC<ProjectModalProps> = (props) => {
  const { projectId, onClose, onRefresh, open = false, ...other } = props;
  const isMounted = useMounted();

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, helpers): Promise<void> => {
      try {
        projectsApi.saveProject({
          id: createResourceId(),
          name: values.name,
          description: values.description,
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
                  autoFocus
                  error={!!(formik.touched.description && formik.errors.description)}
                  fullWidth
                  helperText={formik.touched.description && formik.errors.description}
                  label="Description"
                  name="description"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="text"
                  value={formik.values.description}
                  autoComplete="no"
                  multiline
                  maxRows={6}
                  style={{ height: 150 }}
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
