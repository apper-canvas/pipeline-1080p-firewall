import { cn } from '@/utils/cn'
import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'
import Textarea from '@/components/atoms/Textarea'

const FormField = ({ 
  label, 
  type = 'input', 
  error, 
  className,
  children,
  ...props 
}) => {
  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <Select error={error} {...props}>
            {children}
          </Select>
        )
      case 'textarea':
        return <Textarea error={error} {...props} />
      default:
        return <Input type={type} error={error} {...props} />
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {renderInput()}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export default FormField