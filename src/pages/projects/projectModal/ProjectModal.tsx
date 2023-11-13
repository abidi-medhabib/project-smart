import { FC, useCallback, useEffect } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Button, FormHelperText, MenuItem, TextField } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import { Stack } from '@mui/system';

import { useMounted } from 'src/hooks/use-mounted';
import { TOKEN_STORAGE_KEY } from 'src/contexts/auth/jwt/auth-provider';
import axios from 'axios';
import { DatePicker, DateTimePicker } from '@mui/x-date-pickers';
import { Project } from 'src/types/project';

interface ProjectValues {
  name: string;
  description: string;
  client: string;
  category: string;
  startDate: Date | null;
  endDate: Date | null;
  submit: null;
}

const initialValues: ProjectValues = {
  name: '',
  description: '',
  client: '',
  category: '',
  startDate: null,
  endDate: null,
  submit: null,
};

const validationSchema = Yup.object({
  name: Yup.string().max(255).required('Name is required'),
});

interface ProjectModalProps {
  onClose: () => void;
  onRefresh?: () => void;
  open: boolean;
  project: Project | null;
}

export const ProjectModal: FC<ProjectModalProps> = (props) => {
  const { project, onClose, onRefresh, open = false, ...other } = props;
  const isMounted = useMounted();

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, helpers): Promise<void> => {
      try {
        const accessToken = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
        await axios({
          method: 'post',
          url: 'http://localhost:8080/api/projects',
          headers: { 'Content-Type': 'application/json', 'x-access-token': accessToken },
          data: {
            name: values.name,
            description: values.description,
            client: values.client,
            category: values.category,
            startDate: values.startDate,
            endDate: values.endDate,
            _id: project?._id,
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
    if (project) {
      formik.resetForm({
        values: {
          category: project.category,
          client: project.client,
          description: project.description,
          endDate: project.endDate ? new Date(project.endDate) : null,
          name: project.name,
          startDate: project.startDate ? new Date(project.startDate) : null,
          submit: null,
        },
      });
    }
  }, [project]);

  const handleStartDateChange = useCallback(
    (date: Date | null): void => {
      formik.setFieldValue('startDate', date);

      // Prevent end date to be before start date
      if (formik.values.endDate && date && date > formik.values.endDate) {
        formik.setFieldValue('endDate', date);
      }
    },
    [formik]
  );

  const handleClientChange = useCallback(
    (value: string): void => {
      formik.setFieldValue('client', value);
    },
    [formik]
  );

  const handleCategoryChange = useCallback(
    (value: string): void => {
      formik.setFieldValue('category', value);
    },
    [formik]
  );

  const handleEndDateChange = useCallback(
    (date: Date | null): void => {
      formik.setFieldValue('endDate', date);

      // Prevent start date to be after end date
      if (formik.values.startDate && date && date < formik.values.startDate) {
        formik.setFieldValue('startDate', date);
      }
    },
    [formik]
  );

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
                  rows={6}
                />
                <TextField
                  fullWidth
                  label="select a client"
                  name="client"
                  value={formik.values.client}
                  onBlur={formik.handleBlur}
                  onChange={(v) => handleClientChange(v.target.value)}
                  select
                  autoComplete="no"
                >
                  <MenuItem
                    value=""
                    style={{ height: 40 }}
                  ></MenuItem>
                  <MenuItem value="Client 1">Client 1</MenuItem>
                  <MenuItem value="Client 1">Client 2</MenuItem>
                  <MenuItem value="Client 1">Client 3</MenuItem>
                  <MenuItem value="Client 1">Client 4</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label="select a category"
                  name="category"
                  onBlur={formik.handleBlur}
                  onChange={(v) => handleCategoryChange(v.target.value)}
                  select
                  autoComplete="no"
                  value={formik.values.category}
                >
                  <MenuItem
                    value=""
                    style={{ height: 40 }}
                  ></MenuItem>
                  <MenuItem value="Category 1">Category 1</MenuItem>
                  <MenuItem value="Category 1">Category 2</MenuItem>
                  <MenuItem value="Category 1">Category 3</MenuItem>
                  <MenuItem value="Category 1">Category 4</MenuItem>
                </TextField>
                <DatePicker
                  label="Start date"
                  onChange={handleStartDateChange}
                  value={formik.values.startDate}
                  format="dd/MM/yyyy"
                />
                <DatePicker
                  label="End date"
                  onChange={handleEndDateChange}
                  value={formik.values.endDate}
                  format="dd/MM/yyyy"
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
