
import { useForm } from 'react-hook-form';

const HookForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    alert(`Submitted: ${JSON.stringify(data)}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label>
        Name:
        <input {...register('name', { required: 'Name is required' })} />
        {errors.name && <span className="error">{errors.name.message}</span>}
      </label>
      <label>
        Email:
        <input {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} />
        {errors.email && <span className="error">{errors.email.message}</span>}
      </label>
      <button type="submit">Submit</button>
    </form>
  );
};

export default HookForm;
