import { SelectField } from '@/components/form/selectField'
import { SwitchField } from '@/components/form/switchField'
import { createFormHook, createFormHookContexts } from '@tanstack/react-form'

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts()

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldComponents: { Switch: SwitchField, Select: SelectField },
  formComponents: {},
  fieldContext,
  formContext,
})
