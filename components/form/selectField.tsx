import { Select } from '@/components/ui/select'
import { useFieldContext } from '@/hooks/form'
import { ComponentProps } from 'react'

export const SelectField = (props: ComponentProps<typeof Select>) => {
  const field = useFieldContext<string | undefined>()
  return (
    <Select
      {...props}
      value={field.state.value}
      onOpenChange={(open) => {
        if (!open) {
          field.handleBlur()
        }
      }}
      onValueChange={(newValue) => {
        field.handleChange(newValue)
      }}
    />
  )
}
