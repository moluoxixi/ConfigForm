export function scrollToFirstError(errors: Array<{ path: string }> = []): void {
  if (errors.length === 0) {
    return
  }
  if (typeof document === 'undefined') {
    return
  }

  setTimeout(() => {
    const errorElement = document.querySelector('[data-field-error="true"], [aria-invalid="true"]')
    if (errorElement) {
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      const input = errorElement.querySelector('input, textarea, select') as HTMLElement | null
      input?.focus()
      return
    }

    const firstPath = errors[0].path
    const fieldElements = document.querySelectorAll(`[data-field-path="${firstPath}"], [name="${firstPath}"]`)
    if (fieldElements.length > 0) {
      fieldElements[0].scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, 100)
}
