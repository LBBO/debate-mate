import { Switch } from '@/components/ui/switch'
import { useFieldContext } from '@/hooks/form'
import { ComponentProps } from 'react'

export const SwitchField = (
  props: Omit<
    ComponentProps<typeof Switch>,
    'checked' | 'onCheckedChange' | 'onBlur'
  >,
) => {
  const field = useFieldContext<boolean>()

  return (
    <Switch
      {...props}
      checked={field.state.value}
      onBlur={() => field.handleBlur()}
      onCheckedChange={() => {
        field.handleChange((curr) => !curr)
      }}
    />
  )
}
