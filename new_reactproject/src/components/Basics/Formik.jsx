
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const SignupSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
});

const FormikForm = () => (
  <Formik
    initialValues={{ name: '', email: '' }}
    validationSchema={SignupSchema}
    onSubmit={(values) => {
      alert(`Submitted: ${JSON.stringify(values)}`);
    }}
  >
    {() => (
      <Form>
        <label>
          Name:
          <Field name="name" type="text" />
          <ErrorMessage name="name" component="div" className="error" />
        </label>
        <label>
          Email:
          <Field name="email" type="email" />
          <ErrorMessage name="email" component="div" className="error" />
        </label>
        <button type="submit">Submit</button>
      </Form>
    )}
  </Formik>
);

export default FormikForm;
